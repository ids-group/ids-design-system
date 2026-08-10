import { Directive, TemplateRef, inject, input } from '@angular/core';

/** What a projected header filter is handed. */
export interface HeaderFilterContext {
  /** The column being filtered. */
  readonly $implicit: unknown;
  /** Alias for the column. */
  readonly column: unknown;
  /** Dismisses the popover — call it after applying, so the filter behaves like
   *  the built-in checklist rather than staying open. */
  readonly close: () => void;
}

/**
 * Projects a custom filter into a `ds-table` header popover, for a criterion the
 * built-in checklist cannot express: a date range, a numeric threshold, an async
 * option list.
 *
 * ```html
 * <ds-table [data]="rows" [columns]="cols">
 *   <ng-template
 *     dsHeaderFilter="opened"
 *     [active]="!!range()"
 *     let-close="close"
 *   >
 *     <ds-date-picker mode="range" [(value)]="range" />
 *     <ds-button size="sm" (pressed)="apply(); close()">Apply</ds-button>
 *   </ng-template>
 * </ds-table>
 * ```
 *
 * The table still owns the header button, the popover and the active-filter
 * styling — only the panel's contents change. It cannot know whether YOUR
 * criterion is set, though, so `active` is how the highlight gets told; without
 * it a custom filter renders but the header never marks itself filtered.
 *
 * The column is typed `unknown` for the same reason `dsCellTemplate`'s row is:
 * Angular cannot propagate the parent table's row type into a projected
 * template. Narrow it with a typed helper on the host.
 */
@Directive({
  selector: 'ng-template[dsHeaderFilter]',
  standalone: true,
})
export class HeaderFilterDirective {
  /** Key of the column this filter belongs to. */
  readonly dsHeaderFilter = input.required<string>();
  /** Whether YOUR criterion is currently set, which drives the header's
   *  active-filter styling. */
  readonly active = input(false);

  readonly template = inject(TemplateRef<HeaderFilterContext>);
}
