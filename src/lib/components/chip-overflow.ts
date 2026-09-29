import {
  ElementRef,
  Signal,
  afterRenderEffect,
  computed,
  signal,
  untracked,
} from '@angular/core';

/**
 * @fileoverview How many chips fit one line of a trigger.
 *
 * INVARIANT: nothing here may measure something the cut itself changes, or the
 * measurement feeds back into its own input and the split never settles (a hung
 * page). Hence the budget comes off the trigger's PARENT content box, never the
 * row, and the "+N more" marker gets a fixed reserve rather than a measurement.
 *
 * Chips carry `data-chip` and sit in a row that is a direct child of the trigger.
 * `enabled` gates the whole thing because measuring forces layout.
 */

/**
 * Null when the host cannot supply a budget: a detached node, an inline one with no content box,
 * or one whose own width DEPENDS on the trigger.
 *
 * The dependency is tested by pinning the trigger to zero and re-reading the host, because
 * `getComputedStyle().width` is a used pixel value and the `fit-content` a consumer wrote is not
 * readable back. Costs a second forced layout.
 */
function hostContentWidth(
  host: HTMLElement | null,
  trigger: HTMLElement,
): number | null {
  if (!host || host.clientWidth === 0) {
    return null;
  }
  const styles = getComputedStyle(host);
  if (styles.display === 'inline') {
    return null;
  }

  const before = host.clientWidth;
  const pinned = trigger.style.width;
  trigger.style.width = '0px';
  const dependsOnTrigger = host.clientWidth !== before;
  trigger.style.width = pinned;
  if (dependsOnTrigger) {
    return null;
  }

  return (
    before - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight)
  );
}

/** Room held for "+N more": 4.5em wide with three digits, 5em so a chip is not dropped for a pixel. */
const MARKER_RESERVE_EM = 5;

/** A sibling that can grow gives back what it does not use, so only its floor is owed. */
function reservedWidth(element: HTMLElement): number {
  const styles = getComputedStyle(element);

  return parseFloat(styles.flexGrow) > 0
    ? parseFloat(styles.minWidth) || 0
    : element.offsetWidth;
}

/** @internal */
export function chipFit(
  count: Signal<number>,
  chipRow: Signal<ElementRef<HTMLElement> | undefined>,
  enabled: Signal<boolean>,
  /** The whole selection, which `count` may already cap. */
  selectionSize: Signal<number> = count,
): Signal<number> {
  const available = signal(0);
  const gap = signal(0);
  const markerReserve = signal(0);
  /** Widths of ALL chips, from the last render that held all of them. */
  const chipWidths = signal<readonly number[]>([]);
  /** `count` at that render, so a stale cache is never trusted. */
  const measuredFor = signal(-1);
  /** Geometry the last measure ran against; a repeat is skipped because each measure forces layout. */
  let lastWidth = -1;
  let lastCount = -1;

  const measure = (row: HTMLElement): void => {
    const trigger = row.parentElement;
    if (!trigger) {
      return;
    }

    // A trigger that hugs its content (`width: fit-content`, set by both compact modes) is
    // sized by the chips this cut removes. The parent's content box does not move when the
    // chips do. The trigger-width fallback is that same feedback loop: last resort only.
    const host = trigger.parentElement;
    const budget = hostContentWidth(host, trigger) ?? trigger.clientWidth;

    const width = budget;
    const currentCount = untracked(count);
    const cacheIsCurrent = untracked(measuredFor) === currentCount;
    if (width === lastWidth && currentCount === lastCount && cacheIsCurrent) {
      return;
    }
    lastWidth = width;
    lastCount = currentCount;

    const triggerStyles = getComputedStyle(trigger);
    const columnGap = parseFloat(triggerStyles.columnGap) || 0;
    let free =
      budget -
      parseFloat(triggerStyles.paddingLeft) -
      parseFloat(triggerStyles.paddingRight) -
      parseFloat(triggerStyles.borderLeftWidth) -
      parseFloat(triggerStyles.borderRightWidth);
    for (const sibling of trigger.children) {
      if (sibling !== row) {
        free -= reservedWidth(sibling as HTMLElement) + columnGap;
      }
    }

    gap.set(columnGap);
    available.set(free);
    markerReserve.set(
      MARKER_RESERVE_EM * parseFloat(getComputedStyle(row).fontSize),
    );

    const chips = row.querySelectorAll<HTMLElement>('[data-chip]');
    // A partial render is the previous cut, not the selection: caching it would
    // keep only the survivors' widths, and the row could never grow back.
    if (chips.length === untracked(count)) {
      chipWidths.set([...chips].map((chip) => chip.offsetWidth));
      measuredFor.set(untracked(count));
    }
  };

  afterRenderEffect((onCleanup) => {
    const row = chipRow()?.nativeElement;
    if (!enabled() || !row) {
      return;
    }
    const observer = new ResizeObserver(() => measure(row));
    // The trigger, not the row: the row's box follows the cut, so observing it
    // would report this function's own output back to it.
    observer.observe(row.parentElement ?? row);
    onCleanup(() => observer.disconnect());
  });

  // A selection change does not resize the trigger, so it drives its own measure.
  afterRenderEffect(() => {
    count();
    const row = chipRow()?.nativeElement;
    if (enabled() && row) {
      measure(row);
    }
  });

  return computed<number>(() => {
    const total = count();
    if (!enabled()) {
      return total;
    }
    const widths = chipWidths();
    // Until the widths for THIS selection are in, render all of them: that render
    // is what gets measured, and the row clips it until the cut lands.
    if (measuredFor() !== total || available() <= 0) {
      return total;
    }

    let used = 0;
    for (let index = 0; index < widths.length; index++) {
      const next = used + widths[index] + (index > 0 ? gap() : 0);
      // The marker is only owed room once something is actually hidden, so the
      // last chip may spend what the marker would have taken - but only if this
      // really is the end of the selection, not the end of a capped slice.
      const isLast =
        index === widths.length - 1 && selectionSize() <= widths.length;
      const budget = isLast
        ? available()
        : available() - markerReserve() - gap();
      if (next > budget) {
        // One chip always shows: a trigger too narrow for even that is a layout
        // bug upstream, and 0 would render a bare "+N" with nothing to anchor it.
        return Math.max(1, index);
      }
      used = next;
    }

    return total;
  });
}
