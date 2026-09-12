import {
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  Signal,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Container width as a signal. It is 0 under SSR, while the container is
 *  `display: none`, and before the first observation — a caller that draws at
 *  width 0 divides by zero in every scale.
 *
 *  @internal Exported for the chart entry points; not part of the package surface. */
export function elementWidth(host: ElementRef<HTMLElement>): Signal<number> {
  const width = signal(0);
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return width.asReadonly();
  }

  const observer = new ResizeObserver((entries) => {
    width.set(Math.round(entries[0]?.contentRect.width ?? 0));
  });
  observer.observe(host.nativeElement);
  inject(DestroyRef).onDestroy(() => observer.disconnect());

  return width.asReadonly();
}
