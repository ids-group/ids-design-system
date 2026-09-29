import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
} from '@angular/core';
import type { LayoutAlign, LayoutGap, LayoutJustify } from './layout.types';

@Component({
  selector: 'ds-inline',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrl: './inline.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[attr.data-gap]': 'gap()',
    '[attr.data-align]': 'align()',
    '[attr.data-justify]': 'justify()',
    '[class.nowrap]': '!wrap()',
  },
})
export class InlineComponent {
  /** Space between children. `null` inherits whatever the enclosing layout set. */
  readonly gap = input<LayoutGap | null>(null);
  /** Cross-axis alignment: vertical, for a row. */
  readonly align = input<LayoutAlign | null>(null);
  /** Main-axis distribution: horizontal, for a row. `between` pushes the ends apart. */
  readonly justify = input<LayoutJustify | null>(null);
  /** Let the row wrap onto more lines (default). `false` keeps one line and lets it overflow. */
  readonly wrap = input(true, { transform: booleanAttribute });
}
