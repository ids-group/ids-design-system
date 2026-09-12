import {
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  Signal,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Container width as a signal. Stays 0 under SSR, in a hidden tab and before the
 *  first observation — callers must not render a chart at width 0, or every scale
 *  divides by zero. Writes happen outside the observer callback because writing
 *  geometry inside it is what produces "ResizeObserver loop completed with
 *  undelivered notifications". */
export function elementWidth(host: ElementRef<HTMLElement>): Signal<number> {
  const width = signal(0);
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return width.asReadonly();
  }

  const observer = new ResizeObserver((entries) => {
    const measured = Math.round(entries[0]?.contentRect.width ?? 0);
    queueMicrotask(() => width.set(measured));
  });
  observer.observe(host.nativeElement);
  inject(DestroyRef).onDestroy(() => observer.disconnect());

  return width.asReadonly();
}
