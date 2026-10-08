import { input } from '@angular/core';
import { TableComponent } from '@ids-group-ltd/ids-design-system';

export class AppTable extends TableComponent<{ id: string }> {
  // @ts-expect-error after TS4114
  readonly total = input<number | null>(null);
  // @ts-expect-error after TS4114 TS2416
  readonly animateHeight = true;
}

// @ts-expect-error after TS2415
export class AppTableWithPrivate extends TableComponent<{ id: string }> {
  // @ts-expect-error after TS4114
  private parseDurationMs(raw: string): number {
    return Number(raw);
  }
}
