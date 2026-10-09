import { ButtonComponent } from '@ids-group-ltd/ids-design-system';

export function readRefs(button: ButtonComponent): void {
  // @ts-expect-error after TS2339
  button.buttonRef().nativeElement.focus();
  // @ts-expect-error before TS2339
  button.controlRef().nativeElement.focus();
  // @ts-expect-error both TS2339
  button.controlRef().nativeElement.disabled;
  // @ts-expect-error before TS2339
  const element = button.controlRef().nativeElement;
  if (element instanceof HTMLButtonElement) element.disabled = true;
}
