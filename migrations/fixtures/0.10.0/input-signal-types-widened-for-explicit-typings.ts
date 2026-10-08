import { input, type InputSignal } from '@angular/core';
import { ButtonComponent, type DsSize } from '@ids-group-ltd/ids-design-system';

export function readSize(button: ButtonComponent): DsSize | null {
  // @ts-expect-error after TS2322
  const size: InputSignal<DsSize> = button.size;
  return size();
}

export class AppButton extends ButtonComponent {
  // @ts-expect-error after TS2416
  override readonly size = input<DsSize>('md');
}
