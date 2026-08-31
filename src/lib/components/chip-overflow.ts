import {
  ElementRef,
  Signal,
  afterRenderEffect,
  computed,
  signal,
  untracked,
} from '@angular/core';

/**
 * How many chips fit one line of a trigger, measured rather than guessed.
 *
 * INVARIANT: nothing here may measure something the cut itself changes, or the
 * measurement feeds back into its own input and the split never settles — a hung
 * page, not a wrong number. Hence the space comes off the TRIGGER, never the row,
 * and the "+N more" marker gets a fixed reserve rather than a measurement.
 *
 * The caller owes two things, both enforced by the `chip-row` style block: chips
 * carry `data-chip`, and they sit in a row of their own that is a direct child of
 * the trigger. `enabled` gates the whole thing because measuring forces layout.
 */

/** Room held for "+N more", in em so a retuned type scale carries. Measured at
 *  4.5em wide with three digits; 5em keeps a chip from being dropped for a pixel. */
/**
 * The content width of the element the trigger sits in, or null when there is no
 * usable one — a detached node, or a parent that hugs its content too, in which
 * case it carries the same feedback and measuring it would buy nothing.
 */
function hostContentWidth(host: HTMLElement | null): number | null {
  if (!host || host.clientWidth === 0) {
    return null;
  }
  const styles = getComputedStyle(host);
  if (styles.width === 'fit-content' || styles.display === 'inline') {
    return null;
  }

  return (
    host.clientWidth -
    parseFloat(styles.paddingLeft) -
    parseFloat(styles.paddingRight)
  );
}

const MARKER_RESERVE_EM = 5;

/** What a sibling of the chip row costs the chips. One that can grow gives back
 *  what it does not use, so only its floor is owed; anything else owes its box. */
function reservedWidth(element: HTMLElement): number {
  const styles = getComputedStyle(element);

  return parseFloat(styles.flexGrow) > 0
    ? parseFloat(styles.minWidth) || 0
    : element.offsetWidth;
}

export function chipFit(
  count: Signal<number>,
  chipRow: Signal<ElementRef<HTMLElement> | undefined>,
  enabled: Signal<boolean>,
  /** The whole selection, which `count` may already cap. The last chip may spend
   *  the marker's room only when there is genuinely nothing left to announce —
   *  with a numeric cap there always is, and letting it spend anyway clipped the
   *  "+N more" text itself. */
  selectionSize: Signal<number> = count,
): Signal<number> {
  const available = signal(0);
  const gap = signal(0);
  const markerReserve = signal(0);
  /** Widths of ALL chips, from the last render that held all of them. */
  const chipWidths = signal<readonly number[]>([]);
  /** `count` at that render, so a stale cache is never trusted. */
  const measuredFor = signal(-1);
  /** Geometry the last measure ran against, to skip one that would repeat it.
   *  Each forces layout: before this guard and `enabled` existed, a single docs
   *  page load measured 214 times across seven pickers that were all on the
   *  wrapping default. */
  let lastWidth = -1;
  let lastCount = -1;

  const measure = (row: HTMLElement): void => {
    const trigger = row.parentElement;
    if (!trigger) {
      return;
    }

    // The INVARIANT at the top of this file, made concrete: a trigger that hugs
    // its content (`width: fit-content`, which both compact modes set) has a width
    // decided by the chips this cut removes, so reading it feeds the result back
    // into its own input. The parent's content box is the space actually
    // available and does not move when the chips do. For a `fill` trigger the two
    // are the same number, so nothing changes there.
    const host = trigger.parentElement;
    const budget = hostContentWidth(host) ?? trigger.clientWidth;

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
      // last chip may spend what the marker would have taken — but only if this
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
