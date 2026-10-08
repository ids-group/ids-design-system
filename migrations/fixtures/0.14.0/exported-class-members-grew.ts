import { booleanAttribute, input, signal } from '@angular/core';
import { BarChartComponent, InputComponent, PaginationComponent, TableComponent } from '@ids-group-ltd/ids-design-system';

export class AppPagination extends PaginationComponent {
  // @ts-expect-error after TS4114
  readonly loading = input(false, { transform: booleanAttribute });
}

export class AppTable extends TableComponent<{ id: string }> {
  // @ts-expect-error after TS4114 TS2416
  readonly paginationSize = 1;
}

export class AppInput extends InputComponent {
  // @ts-expect-error after TS4114
  blur(): void {}
}

export class AppBarChart extends BarChartComponent {
  // @ts-expect-error before TS4114
  protected readonly rovingIndex = signal(0);
}
