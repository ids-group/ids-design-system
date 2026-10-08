import {
  Directive,
  ElementRef,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';
import {
  TOOLTIP_PIN_ON_CLICK,
  TooltipDirective,
} from '@ids-group-ltd/ids-design-system/components/tooltip';

/** Marks a term that carries its definition, on any element: `<span dsDefinitionTerm="…">term</span>`.
 *  Styled by the `.ds-definition-term` rules in `styles/ds`. A host other than `<button>` gets
 *  `tabindex="0"` and `role="button"`, and `Enter` / `Space` act as a click on it. */
@Directive({
  selector: '[dsDefinitionTerm]',
  standalone: true,
  hostDirectives: [
    {
      directive: TooltipDirective,
      inputs: ['dsTooltip: dsDefinitionTerm', 'dsTooltipPlacement'],
    },
  ],
  providers: [
    {
      provide: TOOLTIP_PIN_ON_CLICK,
      useFactory: () => inject(DefinitionTermDirective).pinOnClick,
    },
  ],
  host: {
    class: 'ds-definition-term',
    '[attr.type]': "isButton ? 'button' : null",
    '[attr.tabindex]': 'isButton ? null : 0',
    '[attr.role]': "isButton ? null : 'button'",
    '(keydown.enter)': 'pressFromKeyboard($event)',
    '(keydown.space)': 'holdSpace($event)',
    '(keyup.space)': 'pressFromKeyboard($event)',
  },
})
export class DefinitionTermDirective {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;

  protected readonly isButton = this.host.tagName === 'BUTTON';

  /** Keeps the definition open after a click until a click outside, `Escape` or blur. Turn it off
   *  where the click already does something, such as sorting a table column. */
  readonly pinOnClick = input(true, { transform: booleanAttribute });

  protected holdSpace(event: Event): void {
    if (!this.isButton) {
      event.preventDefault();
    }
  }

  protected pressFromKeyboard(event: Event): void {
    if (this.isButton) {
      return;
    }
    event.preventDefault();
    this.host.click();
  }
}
