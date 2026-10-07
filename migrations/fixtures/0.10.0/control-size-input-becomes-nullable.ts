import { ButtonComponent, FieldGroupComponent } from '@ids-group-ltd/ids-design-system';

export function readSizes(button: ButtonComponent, group: FieldGroupComponent): void {
  // @ts-expect-error before TS2339
  // @ts-expect-error after TS2445
  button.sizeResolved();
  // @ts-expect-error before TS2339
  group.sizeResolved();
}
