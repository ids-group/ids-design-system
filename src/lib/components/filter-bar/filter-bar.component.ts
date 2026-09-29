import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  isDevMode,
  signal,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '@ids-group-ltd/ids-design-system/components/button';
import { PopoverComponent } from '@ids-group-ltd/ids-design-system/components/popover';
import { ProjectionDroppedDirective } from '@ids-group-ltd/ids-design-system/components';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';
import { FilterItemDirective } from './filter-item.directive';

// Room for the "+N more" trigger. Measuring it would loop (its width feeds the count that decides
// whether it renders); inline slots may shrink, so a longer translation takes space from them.
const MORE_TRIGGER_WIDTH = 132;

/**
 * Priority+ filter row: renders as many filters as fit and collapses the rest into a "+N more"
 * panel.
 *
 * The split is decided from each item's declared width (`[dsFilterItem]`) plus one
 * `ResizeObserver` on the row, never by measuring the filters, which would flash before being
 * removed.
 *
 * Anything marked `dsFilterBarTrailing` (search, a Clear button) sits at the trailing edge and
 * never collapses. Mark each control rather than wrapping them: the bar owns that row's gap and
 * alignment, and a projected wrapper is a plain block whose children stack.
 *
 * ```html
 * <ds-filter-bar>
 *   <ng-template [dsFilterItem]="180">
 *     <ds-select label="Status" … />
 *   </ng-template>
 *   <ng-template [dsFilterItem]="220">
 *     <ds-date-picker label="Opened" … />
 *   </ng-template>
 *
 *   <ds-search dsFilterBarTrailing … />
 *   <ds-button dsFilterBarTrailing variant="text">Clear</ds-button>
 * </ds-filter-bar>
 * ```
 */
@Component({
  selector: 'ds-filter-bar',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    ButtonComponent,
    PopoverComponent,
    ProjectionDroppedDirective,
  ],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBarComponent {
  private readonly intl = inject(DS_INTL);

  /** Trailing word of the trigger, after the count ("+2 filters"). Unset falls back to
   *  `DS_INTL.filterBar.more`. */
  readonly moreLabel = input<string | null>(null);
  protected readonly moreLabelResolved = computed(
    () => this.moreLabel() ?? this.intl().filterBar.more,
  );
  /** Accessible name of the overflow panel. Unset falls back to
   *  `DS_INTL.filterBar.panelLabel`. */
  readonly panelLabel = input<string | null>(null);
  protected readonly panelLabelResolved = computed(
    () => this.panelLabel() ?? this.intl().filterBar.panelLabel,
  );
  /** Height of the "+N" trigger; set it to match the filters beside it. The bar cannot infer it
   *  from the projected controls. */
  readonly triggerSize = input<DsSize>('md');

  protected readonly devMode = isDevMode();

  // descendants: a filter inside @if or @for lives in an embedded view that a direct-children query misses.
  protected readonly items = contentChildren(FilterItemDirective, {
    descendants: true,
  });

  private readonly row = viewChild<ElementRef<HTMLElement>>('row');
  private readonly rowWidth = signal(0);
  // Read off the row so retuning --ds-filter-bar-gap cannot desynchronise the arithmetic.
  private readonly gap = signal(0);

  protected readonly inlineCount = computed<number>(() => {
    const items = this.items();
    const available = this.rowWidth();
    if (!available) {
      return items.length;
    }

    const gap = this.gap();
    const total = items.reduce(
      (sum, item, index) => sum + (index > 0 ? gap : 0) + item.width(),
      0,
    );
    if (total <= available) {
      return items.length;
    }

    const budget = available - MORE_TRIGGER_WIDTH - gap;
    let used = 0;
    let count = 0;
    for (const item of items) {
      used += (count > 0 ? gap : 0) + item.width();
      if (used > budget) {
        break;
      }
      count++;
    }

    return count;
  });

  protected readonly inline = computed(() =>
    this.items().slice(0, this.inlineCount()),
  );

  readonly collapsed = computed(() => this.items().slice(this.inlineCount()));

  constructor() {
    effect((onCleanup) => {
      const row = this.row()?.nativeElement;
      if (!row) {
        return;
      }

      const measure = (): void => {
        this.rowWidth.set(row.clientWidth);
        this.gap.set(parseFloat(getComputedStyle(row).columnGap) || 0);
      };

      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(row);
      onCleanup(() => observer.disconnect());
    });
  }
}
