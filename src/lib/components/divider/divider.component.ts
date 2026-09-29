import { Component, ViewEncapsulation, input } from '@angular/core';
import type { DividerSpacing, DividerVariant } from './divider.types';

@Component({
  selector: 'ds-divider',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrl: './divider.component.scss',
  host: {
    role: 'separator',
    '[class.strong]': "variant() === 'strong'",
    '[class.vertical]': "variant() === 'vertical'",
    '[class.label]': "variant() === 'label'",
    '[class.spacing-none]': "spacing() === 'none'",
    '[class.spacing-sm]': "spacing() === 'sm'",
    '[class.spacing-md]': "spacing() === 'md'",
    '[class.spacing-lg]': "spacing() === 'lg'",
    '[attr.aria-orientation]': "variant() === 'vertical' ? 'vertical' : null",
  },
  encapsulation: ViewEncapsulation.Emulated,
})
export class DividerComponent {
  /** `default` hairline, `strong` heavier rule, `vertical` for a row, `label` carries projected
   *  text in the middle of the line. */
  readonly variant = input<DividerVariant>('default');
  /** Vertical breathing room around the rule. `none` when the parent layout already owns the gap. */
  readonly spacing = input<DividerSpacing>('md');
}
