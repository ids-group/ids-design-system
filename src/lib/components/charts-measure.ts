import {
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  Signal,
  WritableSignal,
  effect,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Container width as a signal; 0 under SSR, while `display: none`, and before the first observation.
 *
 *  @internal */
export function elementWidth(host: ElementRef<HTMLElement>): Signal<number> {
  const width = signal(0);
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return width.asReadonly();
  }

  inject(DestroyRef).onDestroy(watchElementWidth(host.nativeElement, width));

  return width.asReadonly();
}

/** Writes `element`'s rounded content width into `width` on every change, through the one observer
 *  every chart shares. Returns the call that stops it.
 *
 *  @internal */
export function watchElementWidth(
  element: Element,
  width: WritableSignal<number>,
): () => void {
  widths.set(element, width);
  sharedObserver().observe(element);

  return () => {
    sharedObserver().unobserve(element);
    widths.delete(element);
  };
}

/** `read(host)` as a signal, re-read whenever the host's width changes, so a geometry token re-pointed
 *  at a breakpoint reaches the chart. `initial` until the host is laid out, and under SSR.
 *
 *  @internal */
export function readOnHostResize<T>(
  host: ElementRef<HTMLElement>,
  read: (element: HTMLElement) => T,
  initial: T,
  equal: (previous: T, next: T) => boolean,
): Signal<T> {
  const width = elementWidth(host);
  const value = signal(initial, { equal });
  effect(() => {
    if (width() > 0) {
      value.set(read(host.nativeElement));
    }
  });

  return value.asReadonly();
}

const widths = new WeakMap<Element, WritableSignal<number>>();
let observer: ResizeObserver | null = null;

// One observer for every chart on the page: a resize is one callback carrying every entry.
function sharedObserver(): ResizeObserver {
  observer ??= new ResizeObserver((entries) => {
    for (const entry of entries) {
      widths.get(entry.target)?.set(Math.round(entry.contentRect.width));
    }
  });

  return observer;
}
