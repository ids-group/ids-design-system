import {
  DestroyRef,
  Directive,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Adds `placed` to its host two frames after the host enters the DOM. A chart element that glides
 * between positions gates its `transition` on `.placed`: the browser can compute the host's style
 * before its position binding lands, and an ungated transition then starts it at the origin.
 * Two frames, because after one the bound position may still be unstyled.
 *
 * @internal
 */
@Directive({
  selector: '[dsChartPlaced]',
  standalone: true,
})
export class ChartPlacedDirective {
  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return;
    }
    const host = inject<ElementRef<Element>>(ElementRef).nativeElement;
    let first = 0;
    let second = 0;
    // Outside the zone: under zone.js each frame callback is a full application tick.
    inject(NgZone).runOutsideAngular(() => {
      first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => host.classList.add('placed'));
      });
    });
    inject(DestroyRef).onDestroy(() => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    });
  }
}
