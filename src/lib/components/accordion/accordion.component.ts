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
import type { AccordionChevron } from './accordion.types';

@Component({
  selector: 'ds-accordion',
  standalone: true,
  imports: [],
  template: `<ng-content></ng-content>`,
  styles: [
    `
      @layer ds-component-base {
        :host {
          box-sizing: border-box;
        }
      }
      :host {
        display: block;
        border: var(--border-width-default) solid var(--border-divider);
        border-radius: var(--radius-lg);
        /* glyph-clip-guard: rounds the corners; every head and body pads its text off this edge */
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
  /** When false, opening one item closes the others. */
  readonly multiple = input(true, { transform: booleanAttribute });

  /** Which way the closed chevron points on every item: `right` turns down when an item opens, `down` turns up. */
  readonly chevron = input<AccordionChevron>('right');

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
