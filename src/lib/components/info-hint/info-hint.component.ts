import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { TooltipDirective } from '@ids-group-ltd/ids-design-system/components/tooltip';

@Component({
  selector: 'ds-info-hint',
  standalone: true,
  imports: [IconComponent, TooltipDirective],
  template: `
    <button
      type="button"
      class="info-hint"
      dsTooltipPinOnClick
      [attr.aria-label]="ariaLabel()"
      [dsTooltip]="text()">
      <ds-icon [name]="icon()" [size]="14" />
    </button>
  `,
  styleUrl: './info-hint.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
})
export class InfoHintComponent {
  /** The supplementary text, shown on hover and focus and kept open by a click. */
  readonly text = input.required<string>();
  /** Accessible name of the icon button, such as "About conversion rate". */
  readonly ariaLabel = input.required<string>();
  /** `'help'` draws a question mark in a circle, `'info'` an "i". */
  readonly icon = input<'help' | 'info'>('help');
}
