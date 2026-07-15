import { Component, ViewEncapsulation, input } from '@angular/core';

@Component({
  selector: 'ds-button-group',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrl: './button-group.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'group',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class ButtonGroupComponent {
  /** Accessible name for the group, set as `aria-label` on the `role="group"` host. */
  readonly ariaLabel = input<string | null>(null);
}
