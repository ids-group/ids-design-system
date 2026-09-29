import { InjectionToken } from '@angular/core';

/** Contract that ds-sidenav-item reads from its parent ds-sidenav. */
export interface SidenavContract {
  readonly collapsed: () => boolean;
  /** Whether the active item draws its edge marker; an item can override it. */
  readonly rail: () => boolean;
}

export const SIDENAV = new InjectionToken<SidenavContract>('SIDENAV');
