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
  // null → semantic --space-inline default; named sizes map to the spacing scale.
  readonly gap = input<LayoutGap | null>(null);
  readonly align = input<LayoutAlign | null>(null);
  readonly justify = input<LayoutJustify | null>(null);
  readonly wrap = input(true, { transform: booleanAttribute });
}
