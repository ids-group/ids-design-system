import {
  Directive,
  ElementRef,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';
import { retainStyles } from '@ids-group-ltd/ids-design-system/core';
import {
  TOOLTIP_LEADS_WITH_OWN_TEXT,
  TOOLTIP_PIN_ON_CLICK,
  TooltipDirective,
} from '@ids-group-ltd/ids-design-system/components/tooltip';
import { DefinitionTermStylesComponent } from './definition-term-styles.component';

/** Marks a term that carries its definition, on any element: `<span dsDefinitionTerm="…">term</span>`.
 *  Brings its own `.ds-definition-term` styles; no stylesheet import is needed. A host other than `<button>` gets
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
    { provide: TOOLTIP_LEADS_WITH_OWN_TEXT, useValue: true },
  ],
  host: {
    class: 'ds-definition-term',
    '[attr.type]': "isButton ? 'button' : null",
    '[attr.tabindex]': 'isButton ? null : 0',
    '[attr.role]': "isButton ? null : 'button'",
    '(keydown.enter)': 'pressFromKeyboard($event)',
    '(keyup.enter)': 'release()',
    '(keydown.space)': 'holdSpace($event)',
    '(keyup.space)': 'releaseFromSpace($event)',
    '(blur)': 'release()',
  },
})
export class DefinitionTermDirective {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;

  protected readonly isButton = this.host.tagName === 'BUTTON';

  constructor() {
    retainStyles(DefinitionTermStylesComponent);
  }

  /** Keeps the definition open after a click until a click outside, `Escape` or blur. Turn it off
   *  where the click already does something, such as sorting a table column. */
  readonly pinOnClick = input(true, { transform: booleanAttribute });

  protected holdSpace(event: Event): void {
    if (!this.isButton) {
      event.preventDefault();
      this.host.toggleAttribute('data-ds-pressed', true);
    }
  }

  protected pressFromKeyboard(event: Event): void {
    if (this.isButton) {
      return;
    }
    event.preventDefault();
    this.host.toggleAttribute('data-ds-pressed', true);
    this.host.click();
  }

  protected releaseFromSpace(event: Event): void {
    this.release();
    if (!this.isButton) {
      event.preventDefault();
      this.host.click();
    }
  }

  protected release(): void {
    this.host.toggleAttribute('data-ds-pressed', false);
  }
}
