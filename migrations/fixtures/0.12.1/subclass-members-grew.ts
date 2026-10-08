import { computed, model } from '@angular/core';
import { MenuComponent, TableComponent } from '@ids-group-ltd/ids-design-system';

export class AppMenu extends MenuComponent {
  // @ts-expect-error after TS4114 TS2416
  protected readonly anyIcon = 1;
}

// @ts-expect-error after TS2415
export class AppTable extends TableComponent<object> {
  // @ts-expect-error after TS4114
  private readonly anySelected = computed(() => true);
  // @ts-expect-error after TS4113
  override readonly columnOrder = model<string[] | null>(null);
}

export class AppTableWithStaleMember extends TableComponent<object> {
  // @ts-expect-error before TS4114
  readonly columnWidths = model(new Map<string, number>());
}
