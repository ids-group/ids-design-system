import { TableComponent } from '@ids-group-ltd/ids-design-system';

export class AppTable extends TableComponent<{ id: string }> {
  // @ts-expect-error after TS4114 TS2416
  readonly expandMode = 1;
}

// @ts-expect-error after TS2415
export class AppTableWithPrivate extends TableComponent<{ id: string }> {
  // @ts-expect-error after TS4114
  private columnWidthCeiling(): number {
    return 0;
  }
}
