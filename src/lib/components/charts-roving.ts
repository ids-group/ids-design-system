import { Signal, computed, signal } from '@angular/core';

/** Where a roving tabindex lands after `key`, or `null` when the key does not traverse.
 *
 *  The ends wrap, as they do in `ds-radio-group`: a chart's marks are a closed set, and Home and
 *  End are the direct way to either extreme.
 *
 *  @internal */
export function nextRovingIndex(
  key: string,
  current: number,
  count: number,
): number | null {
  if (!Number.isFinite(count) || count <= 0) {
    return null;
  }
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (current + 1) % count;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

/** The mark `index` within `scope`. `within` narrows the search for a chart whose marks repeat the
 *  same index once per series.
 *
 *  @internal */
export function markAt(
  scope: Element | null,
  index: number,
  within = '',
): Element | null {
  return scope?.querySelector(`${within}[data-mark-index="${index}"]`) ?? null;
}

/** Moves DOM focus to the mark `index` within `scope`, which is what makes the roving tabindex a
 *  traversal rather than a state change nobody can see.
 *
 *  @internal */
export function focusMark(
  scope: Element | null,
  index: number,
  within = '',
): void {
  const target = markAt(scope, index, within);
  if (target instanceof HTMLElement || target instanceof SVGElement) {
    target.focus();
  }
}

/** A chart's roving tab stop.
 *
 *  One tab stop per chart, not one per mark: WCAG 2.1.1's Understanding is explicit that not every
 *  mouse-operable control has to be separately focusable, and that is what keeps a twenty-five
 *  mark chart from being twenty-five stops in the page's tab order.
 *
 *  @internal */
export interface RovingMarks {
  /** The index of the one mark that carries `tabindex="0"`. */
  readonly tabStop: Signal<number>;
  /** Makes `index` the tab stop, for a mark that has taken focus. */
  focus(index: number): void;
  /** Handles an arrow, Home or End pressed on the mark at `index`: moves the tab stop and DOM focus
   *  to the next mark inside `scope`. Any other key is left alone. */
  navigate(event: KeyboardEvent, index: number, scope: Element | null): void;
}

/** @internal */
export function rovingMarks(count: () => number): RovingMarks {
  const roving = signal(0);

  return {
    tabStop: computed(() => Math.min(roving(), Math.max(0, count() - 1))),
    focus: (index) => roving.set(index),
    navigate(event, index, scope) {
      const next = nextRovingIndex(event.key, index, count());
      if (next === null) {
        return;
      }
      event.preventDefault();
      roving.set(next);
      focusMark(scope, next);
    },
  };
}

/** The mark an event on the marks' parent came from - the nearest `[data-mark-index]` inside that
 *  parent - for a chart that listens once per series rather than once per mark. `null` when the
 *  event did not start on a mark.
 *
 *  @internal */
export function markOf(
  event: Event,
): { readonly element: Element; readonly index: number } | null {
  const scope = event.currentTarget;
  const target = event.target;
  if (!(scope instanceof Element) || !(target instanceof Element)) {
    return null;
  }
  const element = target.closest('[data-mark-index]');
  if (!element || !scope.contains(element)) {
    return null;
  }

  return { element, index: Number(element.getAttribute('data-mark-index')) };
}
