import { booleanAttribute, input } from '@angular/core';
import { AccordionComponent, PaginationComponent, SegmentedComponent } from '@ids-group-ltd/ids-design-system';

export class AppSegmented extends SegmentedComponent {
  // @ts-expect-error after TS4114
  readonly joined = input(false, { transform: booleanAttribute });
}

export class AppPagination extends PaginationComponent {
  // @ts-expect-error after TS4114 TS2416
  readonly size = 1;
}

export class AppAccordion extends AccordionComponent {
  // @ts-expect-error after TS4113
  override readonly multi = input(true, { transform: booleanAttribute });
}
