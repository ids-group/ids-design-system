import {
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';

// The shimmer animates `background-position`, which the browser recomputes on the main thread every
// frame whether or not the placeholder is on screen. One observer for every skeleton pauses the
// ones out of view.
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
  /** CSS width of the placeholder (e.g. `'120px'`, `'50%'`). */
  readonly width = input<string | undefined>(undefined);
  /** CSS height of the placeholder. */
  readonly height = input<string | undefined>(undefined);
  /** Pill radius, for avatar/dot-shaped placeholders. */
  readonly circle = input(false, { transform: booleanAttribute });
  /** `display: inline-block` instead of `block`, to sit inline with text. */
  readonly inline = input(false, { transform: booleanAttribute });
  /** Whether the wave passes over the placeholder. Default `true`. Off, it is a flat block of the
   *  same shape and size - for a space held for something that is not loading yet, where motion
   *  would claim work that is not happening and cost a main-thread update a frame. */
  readonly shimmer = input(true, { transform: booleanAttribute });

  constructor() {
    if (typeof IntersectionObserver !== 'undefined') {
      inject(DestroyRef).onDestroy(
        observeVisibility(
          inject<ElementRef<Element>>(ElementRef).nativeElement,
          inject(NgZone),
        ),
      );
    }
  }
}
