import { PaginationComponent, TableComponent, TooltipDirective } from '@ids-group-ltd/ids-design-system';

export class AppTable extends TableComponent<{ id: string }> {
  // @ts-expect-error after TS4114
  rowKey(row: { id: string }): string {
    return row.id;
  }
}

export class AppPagination extends PaginationComponent {
  // @ts-expect-error after TS4114 TS2416
  readonly showPageSize = 'always';
}

// @ts-expect-error after TS2415
export class AppTooltip extends TooltipDirective {
  // @ts-expect-error after TS4114
  private scheduleShow(): void {}
}

export class AppTooltipWithOldHook extends TooltipDirective {
  // @ts-expect-error after TS4113
  protected override onOpen(): void {}
}
