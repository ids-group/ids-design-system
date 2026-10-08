import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';
import {
  TOOLTIP_LEADS_WITH_OWN_TEXT,
  TOOLTIP_PIN_ON_CLICK,
  TooltipDirective,
} from '@ids-group-ltd/ids-design-system/components/tooltip';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[dsDefinitionTerm]',
  standalone: true,
  template: '<ng-content />',
  styleUrl: './definition-term.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  hostDirectives: [
    {
      directive: TooltipDirective,
      inputs: ['dsTooltip: dsDefinitionTerm', 'dsTooltipPlacement'],
    },
  ],
  providers: [
    {
      provide: TOOLTIP_PIN_ON_CLICK,
      useFactory: () => inject(DefinitionTermComponent).pinOnClick,
    },
    { provide: TOOLTIP_LEADS_WITH_OWN_TEXT, useValue: true },
  ],
  host: { type: 'button' },
})
export class DefinitionTermComponent {
  /** Keeps the definition open after a click until a click outside, `Escape` or blur. Turn it off
   *  where the click already does something, such as sorting a table column. */
  readonly pinOnClick = input(true, { transform: booleanAttribute });
}
