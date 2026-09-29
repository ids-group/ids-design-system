import { Directive, TemplateRef, inject, input } from '@angular/core';

/** What a projected header filter is handed. */
export interface HeaderFilterContext {
  /** The column being filtered. */
  readonly $implicit: unknown;
  /** Alias for the column. */
  readonly column: unknown;
  /** Dismisses the popover; call it after applying. */
  readonly close: () => void;
}

/**
 * Projects a custom filter into a `ds-table` header popover, for a criterion the built-in
 * checklist cannot express.
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
 * The table cannot know whether YOUR criterion is set: without `active` the header never marks
 * itself filtered.
 *
 * The column is typed `unknown`; narrow it with a typed helper on the host.
 */
@Directive({
  selector: 'ng-template[dsHeaderFilter]',
  standalone: true,
})
export class HeaderFilterDirective {
  /** Key of the column this filter belongs to. */
  readonly dsHeaderFilter = input.required<string>();
  /** Whether YOUR criterion is set; drives the header's active-filter styling. */
  readonly active = input(false);

  readonly template = inject(TemplateRef<HeaderFilterContext>);
}
