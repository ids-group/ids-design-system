import {
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  Signal,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Container width as a signal. It is 0 under SSR, while the container is
 *  `display: none`, and before the first observation.
 *
 *  @internal */
export function elementWidth(host: ElementRef<HTMLElement>): Signal<number> {
  const width = signal(0);
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return width.asReadonly();
  }

  const element = host.nativeElement;
  widths.set(element, width);
  sharedObserver().observe(element);
  inject(DestroyRef).onDestroy(() => {
    sharedObserver().unobserve(element);
    widths.delete(element);
  });

  return width.asReadonly();
}

const widths = new WeakMap<Element, WritableSignal<number>>();
let observer: ResizeObserver | null = null;

// One observer for every chart on the page, so a resize is one callback with every entry in it
// rather than one callback per chart.
function sharedObserver(): ResizeObserver {
  observer ??= new ResizeObserver((entries) => {
    for (const entry of entries) {
      widths.get(entry.target)?.set(Math.round(entry.contentRect.width));
    }
  });

  return observer;
}
