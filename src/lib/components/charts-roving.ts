import {
  DestroyRef,
  NgZone,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import type { ElementRef, Signal } from '@angular/core';

/** Where a roving tabindex lands after `key`, or `null` when the key does not traverse.
 *  The ends wrap, as in `ds-radio-group`; Home and End jump to either extreme.
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

/** The mark `index` within `scope`. `within` narrows the search for a chart whose marks repeat an index per series.
 *
 *  @internal */
export function markAt(
  scope: Element | null,
  index: number,
  within = '',
): Element | null {
  return scope?.querySelector(`${within}[data-mark-index="${index}"]`) ?? null;
}

/** Moves DOM focus to the mark `index` within `scope`.
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

/** A chart's roving tab stop: one per chart, not one per mark.
 *
 *  @internal */
export interface RovingMarks {
  /** The index of the mark that carries `tabindex="0"`. */
  readonly tabStop: Signal<number>;
  /** Makes `index` the tab stop. */
  focus(index: number): void;
  /** Handles an arrow, Home or End on the mark at `index`: moves the tab stop and DOM focus within `scope`. */
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

/** @internal */
export interface MarkHit {
  readonly element: Element;
  readonly index: number;
}

/** Whether a `pointerout` from `hit` left the mark, rather than crossing into another part of it.
 *
 *  @internal */
export function leftMark(event: PointerEvent, hit: MarkHit): boolean {
  const next =
    event.relatedTarget instanceof Element
      ? event.relatedTarget.closest('[data-mark-index]')
      : null;

  return next !== hit.element;
}

/** The mark an event on the marks' parent came from (the nearest `[data-mark-index]`), or `null`.
 *
 *  @internal */
export function markOf(
  event: Event,
  scope: EventTarget | null = event.currentTarget,
): MarkHit | null {
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

/** Focus arriving on and leaving a mark inside `scope`, heard from the document, not the marks' group:
 *  Chromium makes an SVG element focusable once it has a focus listener, so a listening group would
 *  take focus on a click and ring every mark it holds. Call from an injection context.
 *
 *  @internal */
export function listenForMarkFocus(
  scope: ElementRef<Element>,
  onFocus: (event: FocusEvent, mark: MarkHit) => void,
  onBlur?: (event: FocusEvent, mark: MarkHit) => void,
): void {
  const zone = inject(NgZone);
  const destroyRef = inject(DestroyRef);
  afterNextRender(() => {
    const host = scope.nativeElement;
    const document = host.ownerDocument;
    const forward =
      (handler?: (event: FocusEvent, mark: MarkHit) => void) =>
      (event: FocusEvent): void => {
        const hit = handler && markOf(event, host);
        if (hit) {
          handler(event, hit);
        }
      };
    const focusIn = forward(onFocus);
    const focusOut = forward(onBlur);
    // Outside the zone: every focus change reaches every series.
    zone.runOutsideAngular(() => {
      document.addEventListener('focusin', focusIn);
      document.addEventListener('focusout', focusOut);
    });
    destroyRef.onDestroy(() => {
      document.removeEventListener('focusin', focusIn);
      document.removeEventListener('focusout', focusOut);
    });
  });
}
