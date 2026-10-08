import { computed } from '@angular/core';
import { ColumnSeriesComponent, PaginationComponent, TooltipDirective } from '@ids-group-ltd/ids-design-system';

export class AppPagination extends PaginationComponent {
  // @ts-expect-error after TS4114
  protected readonly empty = computed(() => false);
}

export class AppPaginationFlag extends PaginationComponent {
  // @ts-expect-error after TS4114 TS2416
  protected readonly empty = 0;
}

// @ts-expect-error after TS2415
export class AppTooltip extends TooltipDirective {
  // @ts-expect-error after TS4114
  private detachAncestor: (() => void) | null = null;
}

export class AppColumnSeries extends ColumnSeriesComponent {
  // @ts-expect-error before TS4114 TS2416 TS2425
  protected slotStepPx(): number {
    return 0;
  }
}
