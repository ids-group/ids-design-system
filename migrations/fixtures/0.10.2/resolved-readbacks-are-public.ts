import { computed } from '@angular/core';
import { ButtonComponent, type DsSize } from '@ids-group-ltd/ids-design-system';

export function readSize(button: ButtonComponent): DsSize {
  // @ts-expect-error before TS2445
  return button.sizeResolved();
}

// @ts-expect-error after TS2415
export class AppButton extends ButtonComponent {
  protected override readonly sizeResolved = computed((): DsSize => 'md');
}
