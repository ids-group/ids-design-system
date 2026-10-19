import {
  Component,
  ElementRef,
  NgZone,
  ViewEncapsulation,
  booleanAttribute,
  effect,
  inject,
  input,
} from '@angular/core';
import { retainStyles } from '@ids-group-ltd/ids-design-system/core';

// The shimmer animates `background-position` on the main thread even off screen; one shared
// observer pauses the skeletons out of view.
let offscreenObserver: IntersectionObserver | null = null;

function observeVisibility(host: Element, zone: NgZone): () => void {
  offscreenObserver ??= zone.runOutsideAngular(
    () =>
      new IntersectionObserver((entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
        }
      }),
  );
  const observer = offscreenObserver;
  observer.observe(host);

  return () => observer.unobserve(host);
}

@Component({
  selector: 'ds-skeleton',
  standalone: true,
  template: '',
  styleUrl: './skeleton.component.scss',
  host: {
    'aria-hidden': 'true',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
    '[class.circle]': 'circle()',
    '[class.inline]': 'inline()',
    '[class.still]': '!shimmer()',
  },
  encapsulation: ViewEncapsulation.Emulated,
})
export class SkeletonComponent {
  /** CSS width, e.g. `'120px'` or `'50%'`. */
  readonly width = input<string | undefined>(undefined);
  /** CSS height. */
  readonly height = input<string | undefined>(undefined);
  /** Pill radius, for avatar/dot-shaped placeholders. */
  readonly circle = input(false, { transform: booleanAttribute });
  /** `display: inline-block` instead of `block`, to sit inline with text. */
  readonly inline = input(false, { transform: booleanAttribute });
  /** Whether the wave passes over the placeholder; off, it is a flat block of the same shape. */
  readonly shimmer = input(true, { transform: booleanAttribute });

  constructor() {
    retainStyles(SkeletonComponent);
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    const host = inject<ElementRef<Element>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    // Each observed skeleton costs an intersection computation per scrolled frame; a still one has nothing to pause.
    effect((onCleanup) => {
      if (this.shimmer()) {
        onCleanup(observeVisibility(host, zone));
      }
    });
  }
}
