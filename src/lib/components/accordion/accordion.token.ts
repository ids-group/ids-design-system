import { InjectionToken } from '@angular/core';

/** Contract that ds-accordion-item reads from its parent ds-accordion. */
export interface AccordionContract {
  readonly multi: () => boolean;
  /** Called when an item opens; coordinator may close other items. */
  notifyOpen(item: AccordionItemRef): void;
}

/** Contract ds-accordion reads back from each projected item. */
export interface AccordionItemRef {
  /** Closes this item (sets expanded to false). */
  closeItem(): void;
}

export const ACCORDION = new InjectionToken<AccordionContract>('ACCORDION');
