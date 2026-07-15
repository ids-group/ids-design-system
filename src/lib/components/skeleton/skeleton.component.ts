import { Component, ViewEncapsulation, booleanAttribute, input } from '@angular/core';

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
}
