import { Component, ViewEncapsulation, input } from '@angular/core';
import type { LayoutAlign, LayoutGap } from './layout.types';

@Component({
  selector: 'ds-stack',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrl: './stack.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[attr.data-gap]': 'gap()',
    '[attr.data-align]': 'align()',
  },
})
export class StackComponent {
  // null → semantic --space-stack default; named sizes map to the spacing scale.
  /** Space between children. `null` inherits whatever the enclosing layout set. */
  readonly gap = input<LayoutGap | null>(null);
  /** Cross-axis alignment — horizontal, for a column. */
  readonly align = input<LayoutAlign | null>(null);
}
