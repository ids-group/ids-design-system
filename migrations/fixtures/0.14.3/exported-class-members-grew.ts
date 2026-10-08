import { DrawerComponent, TextareaComponent } from '@ids-group-ltd/ids-design-system';

export class AppDrawer extends DrawerComponent {
  // @ts-expect-error after TS4114 TS2416
  protected readonly preview = false;
}

export class AppTextarea extends TextareaComponent {
  // @ts-expect-error after TS4114 TS2416
  readonly countTrimmed = 'yes';
}
