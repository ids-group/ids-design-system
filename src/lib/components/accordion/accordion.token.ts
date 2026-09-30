import { InjectionToken } from '@angular/core';
import type { AccordionChevron } from './accordion.types';

/** Contract that ds-accordion-item reads from its parent ds-accordion. */
export interface AccordionContract {
  readonly multiple: () => boolean;
  readonly chevron: () => AccordionChevron;
  notifyOpen(item: AccordionItemRef): void;
}

/** Contract ds-accordion reads back from each projected item. */
export interface AccordionItemRef {
  closeItem(): void;
}

export const ACCORDION = new InjectionToken<AccordionContract>('ACCORDION');
