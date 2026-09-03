import * as React from 'react';

/**
 * SidenavFooter — the real SidenavFooterComponent, run by Angular behind `<ds-sidenav-footer>`.
 * Bottom block of the app sidenav — port of `ds-sidenav-footer`. Quick actions (Search / Alerts / Collapse) plus the signed-in user with an account menu. Pins itself to the bottom via `margin-top: auto` — render it as the LAST child of `Sidenav`.
 */
export interface SidenavFooterProps {
  /** Name shown in the footer's account row. */
  userName?: string;
  /** Secondary line under the name (role / organisation). */
  userRole?: string;
  /** Show the unread dot on the Alerts row. */
  alerts?: boolean;
  /** Mirrors the rail's collapsed state — labels hide, the avatar + icons stay. */
  collapsed?: boolean;
  /** When set, the Search row opens a live results popover; unset keeps it inert. */
  searchProvider?: unknown;
  /** When non-null (even empty) the Alerts row opens a list popover; null keeps it inert. */
  alertItems?: unknown;
  /** Route for the account menu's "Your profile"; empty = the item is a no-op. */
  profileRoute?: string;
  /** The collapse control was activated. The footer does not collapse itself — `ds-app-layout` owns the rail state, so the host relays this. */
  onCollapseToggled?: (value: void) => void;
  /** Emitted when the Alerts popover is opened, so the layout can mark-all-read. */
  onAlertsOpened?: (value: void) => void;
  /** Emitted when "Sign out" is chosen; the layout owns the actual logout flow. */
  onSignOutSelected?: (value: void) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const SidenavFooter: React.ComponentType<SidenavFooterProps>;
