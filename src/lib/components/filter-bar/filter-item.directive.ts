import { Directive, TemplateRef, inject, input } from '@angular/core';

const DEFAULT_ITEM_WIDTH = 180;

function toWidth(value: unknown): number {
  const width = Number(value);

  return Number.isFinite(width) && width > 0 ? width : DEFAULT_ITEM_WIDTH;
}

/**
 * One filter inside `ds-filter-bar`, with the width it should occupy:
 * `<ng-template [dsFilterItem]="220"> <ds-date-picker … /> </ng-template>`.
 *
 * A template, because projected DOM cannot be relocated into the overflow panel. Crossing the
 * boundary destroys and re-creates the view, so a control's internal state (open panel, focus)
 * is lost on collapse; its value survives in the consumer's own signal or form control.
 *
 * The width is a contract, not a hint: the slot is sized to exactly this, so a wider control is
 * narrowed rather than allowed to break the row.
 */
@Directive({
  selector: 'ng-template[dsFilterItem]',
  standalone: true,
})
export class FilterItemDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);

  /** Slot width in px. Bare `dsFilterItem` (or a non-positive value) means 180. */
  readonly width = input(DEFAULT_ITEM_WIDTH, {
    alias: 'dsFilterItem',
    transform: toWidth,
  });
}
