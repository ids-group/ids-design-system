import { computed, ElementRef, viewChild } from '@angular/core';
import { ButtonComponent, CheckboxComponent } from '@ids-group-ltd/ids-design-system';

// @ts-expect-error after TS2415
export class AppButton extends ButtonComponent {
  // @ts-expect-error after TS4114
  private readonly destination = computed((): never => {
    throw new Error();
  });
}

export class AppCheckbox extends CheckboxComponent {
  // @ts-expect-error after TS4114 TS2416 TS2425
  protected resolvedAriaLabel(): string {
    return '';
  }
}

export class AppButtonMarked extends ButtonComponent {
  // @ts-expect-error after TS4113
  override readonly buttonRef = viewChild.required<ElementRef<HTMLButtonElement>>('btn');
}

export class AppButtonUnmarked extends ButtonComponent {
  // @ts-expect-error before TS4114
  readonly buttonRef = viewChild.required<ElementRef<HTMLButtonElement>>('btn');
}
