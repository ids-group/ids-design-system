import {
  DestroyRef,
  Directive,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { afterTwoFrames } from '@ids-group-ltd/ids-design-system/components';

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
    inject(DestroyRef).onDestroy(
      afterTwoFrames(inject(NgZone), () => host.classList.add('placed')),
    );
  }
}
