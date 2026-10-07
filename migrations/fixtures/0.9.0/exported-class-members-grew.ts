import { booleanAttribute, input } from '@angular/core';
import { TableComponent } from '@ids-group-ltd/ids-design-system';

export class AppTable extends TableComponent<{ id: string }> {
  // @ts-expect-error after TS4114
  readonly lazy = input(false, { transform: booleanAttribute });
  // @ts-expect-error after TS4114 TS2416
  readonly filterMode = 1;
}

// @ts-expect-error after TS2415
export class AppTableWithOptions extends TableComponent<{ id: string }> {
  // @ts-expect-error after TS4114
  private optionsFor(): readonly string[] {
    return [];
  }
}

// @ts-expect-error before TS2415
export class AppTableWithDistinct extends TableComponent<{ id: string }> {
  // @ts-expect-error before TS4114
  private distinctValuesOf(): string[] {
    return [];
  }
}
