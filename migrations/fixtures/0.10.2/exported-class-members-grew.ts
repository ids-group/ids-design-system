import { input } from '@angular/core';
import { MenuItemComponent, TableComponent, TimePickerComponent } from '@ids-group-ltd/ids-design-system';

export class AppMenuItem extends MenuItemComponent {
  // @ts-expect-error after TS4114
  readonly description = input<string>('');
}

export class AppTable extends TableComponent<{ id: string }> {
  // @ts-expect-error after TS4114 TS2416
  readonly visibleRowActions = 1;
}

// @ts-expect-error after TS2415
export class AppTimePicker extends TimePickerComponent {
  // @ts-expect-error after TS4114
  private insideATrigger(target: Node): boolean {
    return !!target;
  }
}
