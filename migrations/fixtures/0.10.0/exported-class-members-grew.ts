import { booleanAttribute, input } from '@angular/core';
import { CardComponent, InputComponent, ModalComponent, SearchComponent, TableComponent } from '@ids-group-ltd/ids-design-system';

export class AppCard extends CardComponent {
  // @ts-expect-error after TS4114
  protected onActivationKey(event: Event): void {}
}

export class AppInput extends InputComponent {
  // @ts-expect-error after TS4114 TS2416
  readonly controlState = 1;
}

// @ts-expect-error after TS2415
export class AppSearch extends SearchComponent {
  // @ts-expect-error after TS4114
  private pending: ReturnType<typeof setTimeout> | null = null;
}

export class AppTable extends TableComponent<{ id: string }> {
  markExporting(): void {
    // @ts-expect-error after TS2339
    this.exporting.set(true);
  }
}

export class AppModal extends ModalComponent {
  // @ts-expect-error after TS4113
  override readonly error = input(false, { transform: booleanAttribute });
}
