import { computed, input } from '@angular/core';
import { ButtonComponent, InputComponent, SidenavComponent, TableComponent } from '@ids-group-ltd/ids-design-system';

export class AppSidenav extends SidenavComponent {
  // @ts-expect-error after TS4114
  protected readonly brandAriaLabel = computed(() => 'Home');
}

export class AppTable extends TableComponent<{ id: string }> {
  // @ts-expect-error after TS4114 TS2416
  readonly cellLink = 1;
}

export class AppButton extends ButtonComponent {
  // @ts-expect-error after TS4114
  readonly hint = input<string, string | null | undefined>('', { transform: (value) => value?.trim() ?? '' });
}

export class AppInput extends InputComponent {
  override readonly hint = input<string, string | null | undefined>('', { transform: (value) => value?.trim() ?? '' });
}
