import { input, type InputSignal } from '@angular/core';
import { InputComponent } from '@ids-group-ltd/ids-design-system';

export function readMax(field: InputComponent): void {
  // @ts-expect-error after TS2322
  const max: InputSignal<number | null> = field.max;
  max();
}

export class AppInput extends InputComponent {
  // @ts-expect-error after TS2416
  override readonly min = input<number | null>(null);
}
