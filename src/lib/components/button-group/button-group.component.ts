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
  /** `aria-label` of the `role="group"` host. */
  readonly ariaLabel = input<string | null>(null);
}
