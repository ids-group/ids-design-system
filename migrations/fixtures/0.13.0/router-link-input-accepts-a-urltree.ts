import { input } from '@angular/core';
import { ButtonComponent } from '@ids-group-ltd/ids-design-system';

const isList = (value: unknown): value is readonly unknown[] => Array.isArray(value);

export function firstSegment(button: ButtonComponent): string | undefined {
  const link = button.routerLink();
  if (link === null || isList(link)) return undefined;
  // @ts-expect-error after TS2339
  return link.split('/')[0];
}

export class AppButton extends ButtonComponent {
  // @ts-expect-error after TS2416
  override readonly routerLink = input<string | readonly unknown[] | null>(null);
}
