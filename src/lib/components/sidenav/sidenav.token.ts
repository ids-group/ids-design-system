import { InjectionToken } from '@angular/core';

/** Contract that ds-sidenav-item reads from its parent ds-sidenav. */
export interface SidenavContract {
  readonly collapsed: () => boolean;
}

export const SIDENAV = new InjectionToken<SidenavContract>('SIDENAV');
