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
 * `ds-filter-bar` splits the same way from each item's DECLARED width, and its
 * comment says why it refuses to measure: the items must be in the DOM to be
 * measured, so anything that did not fit would flash before being taken away. A
 * chip has no declared width — it is as wide as its label — so this has to
 * measure. What makes that safe is the ROW: in fit mode it is `nowrap` with
 * `overflow: hidden`, so the chips that will be dropped are clipped for the frame
 * they exist, and clipping moves nothing. The flash filter-bar avoids is a WRAP,
 * which changes the trigger's height.
 *
 * THE RULE, because breaking it froze a real page twice: nothing here may measure
 * something the cut itself changes, or the measurement feeds back into its own
 * input and the split never settles. That is why the space is taken from the
 * TRIGGER rather than from the row, which is sized by its content, and why the
 * "+N more" marker gets a fixed reserve rather than a measurement, its text being
 * the count itself.
 *
 * The caller owes two things, both held up by the `chip-row` style block: chips
 * carry `data-chip`, and they sit in a row of their own that is a direct child of
 * the trigger. `enabled` is not a convenience — measuring forces layout, so a
 * picker left on the wrapping default must not pay for a mode it does not use.
 */

/** Room held for "+N more", as a multiple of its own font size so a retuned type
 *  scale carries. At the default 12px the string is 47px at one digit and 54px at
 *  three, i.e. 4.5em; 5em keeps a chip from being dropped for a pixel. */
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

    const width = trigger.clientWidth;
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
      trigger.clientWidth -
      parseFloat(triggerStyles.paddingLeft) -
      parseFloat(triggerStyles.paddingRight);
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
      // last chip may spend what the marker would have taken.
      const isLast = index === widths.length - 1;
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
