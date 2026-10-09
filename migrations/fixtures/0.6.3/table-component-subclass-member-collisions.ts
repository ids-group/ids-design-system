import { TableComponent } from '@ids-group-ltd/ids-design-system';

export class AppTable extends TableComponent<{ id: string }> {
  // @ts-expect-error after TS4114
  exportCsv(): void {}
  // @ts-expect-error after TS4114 TS2416
  readonly columnOrder: string[] = [];
}
