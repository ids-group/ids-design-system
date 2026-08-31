import { Directive, TemplateRef, inject, input } from '@angular/core';

/** Width assumed for a filter that declares none — roughly a `ds-select`. */
const DEFAULT_ITEM_WIDTH = 180;

function toWidth(value: unknown): number {
  const width = Number(value);

  return Number.isFinite(width) && width > 0 ? width : DEFAULT_ITEM_WIDTH;
}

/**
 * One filter inside `ds-filter-bar`, with the width it should occupy:
 * `<ng-template [dsFilterItem]="220"> <ds-date-picker … /> </ng-template>`.
 *
 * A template rather than plain projection because the bar has to MOVE the filters
 * that do not fit into its overflow panel, and projected DOM cannot be relocated
 * — it renders where it was projected. The cost is that crossing the boundary
 * destroys and re-creates the view, so a control's internal state (an open panel,
 * focus) does not survive a resize that collapses it. Its VALUE does: that lives
 * in the consumer's own signal or form control.
 *
 * The width is a contract, not a hint — the bar sizes the slot to exactly this
 * and decides the split from it, so a control that would render wider is
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
