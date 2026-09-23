import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  contentChildren,
  forwardRef,
  input,
} from '@angular/core';
import {
  ACCORDION,
  type AccordionContract,
  type AccordionItemRef,
} from './accordion.token';
import { AccordionItemComponent } from './accordion-item.component';

@Component({
  selector: 'ds-accordion',
  standalone: true,
  imports: [],
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        display: block;
        border: var(--border-width-default) solid var(--border-divider);
        border-radius: var(--radius-lg);
        overflow: hidden;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: ACCORDION,
      useExisting: forwardRef(() => AccordionComponent),
    },
  ],
})
export class AccordionComponent implements AccordionContract {
  /** When false, opening one item automatically closes all others. */
  readonly multiple = input(true, { transform: booleanAttribute });

  private readonly items = contentChildren(AccordionItemComponent);

  notifyOpen(opened: AccordionItemRef): void {
    if (this.multiple()) {
      return;
    }
    for (const item of this.items() as unknown as AccordionItemRef[]) {
      if (item !== opened) {
        item.closeItem();
      }
    }
  }
}
