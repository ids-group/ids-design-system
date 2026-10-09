import { computed, signal } from '@angular/core';
import { InputComponent, PopoverComponent, TableComponent } from '@ids-group-ltd/ids-design-system';

export class AppTable extends TableComponent<{ id: string }> {
  // @ts-expect-error after TS4114
  readonly exporting = signal(false);
}

// @ts-expect-error after TS2415
export class AppTableWithLayout extends TableComponent<{ id: string }> {
  // @ts-expect-error after TS4114
  private saveLayout(key: string, order: string[] | null, widths: Map<string, number>, hidden: Set<string> | null): void {}
}

export class AppInput extends InputComponent {
  // @ts-expect-error after TS4113
  protected override readonly messageState = computed((): never => {
    throw new Error();
  });
  // @ts-expect-error after TS4114 TS2416
  readonly ariaDescribedBy = 1;
}

export class AppPopover extends PopoverComponent {
  override close(): void {}
}
