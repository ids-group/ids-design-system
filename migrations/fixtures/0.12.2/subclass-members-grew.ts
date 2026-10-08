import { computed } from '@angular/core';
import { SidenavGroupComponent, TableComponent } from '@ids-group-ltd/ids-design-system';

export class AppTable extends TableComponent<{ id: string }> {
  // @ts-expect-error after TS4114
  protected readonly showsLoadingSpace = computed(() => false);
  // @ts-expect-error after TS4114 TS2416
  protected isFilterPanelOpen(index: number): string {
    return '';
  }
}

// @ts-expect-error after TS2415
export class AppTableWithPrivate extends TableComponent<{ id: string }> {
  // @ts-expect-error after TS4114
  private scrollAncestor(): HTMLElement | null {
    return null;
  }
}

export class AppSidenavGroup extends SidenavGroupComponent {
  // @ts-expect-error after TS4114 TS2416
  readonly routerLink = '/home';
}
