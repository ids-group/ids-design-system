import { input, type InputSignal } from '@angular/core';
import { StatComponent } from '@ids-group-ltd/ids-design-system';

export function readValue(stat: StatComponent): string | number {
  // @ts-expect-error after TS2322
  const value: InputSignal<string | number> = stat.value;
  return value();
}

export class AppStat extends StatComponent {
  // @ts-expect-error after TS2416
  override readonly value = input<string | number>('');
}
