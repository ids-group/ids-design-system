import { Component, ViewEncapsulation, input } from '@angular/core';
import type { DividerSpacing, DividerVariant } from './divider.types';

@Component({
  selector: 'ds-divider',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrl: './divider.component.scss',
  host: {
    role: 'separator',
    '[class.strong]':   "variant() === 'strong'",
    '[class.vertical]': "variant() === 'vertical'",
    '[class.label]':    "variant() === 'label'",
    '[class.spacing-none]': "spacing() === 'none'",
    '[class.spacing-sm]':   "spacing() === 'sm'",
    '[class.spacing-md]':   "spacing() === 'md'",
    '[class.spacing-lg]':   "spacing() === 'lg'",
    '[attr.aria-orientation]': "variant() === 'vertical' ? 'vertical' : null",
  },
  encapsulation: ViewEncapsulation.Emulated,
})
export class DividerComponent {
  readonly variant = input<DividerVariant>('default');
  // Vertical margin around the divider. Defaults to `md` (8px) for parity
  // with menus / sidenavs; bump to `lg` for content-section separators.
  readonly spacing = input<DividerSpacing>('md');
}
