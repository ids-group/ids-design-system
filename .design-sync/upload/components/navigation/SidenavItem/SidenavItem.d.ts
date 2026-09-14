import * as React from 'react';

/**
 * SidenavItem — the real SidenavItemComponent, run by Angular behind `<ds-sidenav-item>`.
 * Single sidenav link — port of `ds-sidenav-item`. An anchor with leading icon, label, and optional trailing extras; place inside `Sidenav` (directly or via `SidenavGroup`).
 */
export interface SidenavItemProps {
  /** Icon shown before the label; omit to project a custom icon via the `[icon]` slot instead. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** Visible link text; also used as the tooltip/aria-label when the rail is collapsed. */
  label?: string;
  /** Plain `href` target, used when `routerLink` is not set. */
  href?: string;
  /** Angular `RouterLink` target — string or array form for dynamic segments. */
  routerLink?: unknown;
  /** Applies the active style; also drives `aria-current` when not using `routerLink`. */
  active?: boolean;
  /** Overrides what an active item announces. Unset, an exact match announces `page` and a prefix match announces `true` — in a sidenav the prefix case is "you are in this section", which is exactly what `true` means. */
  ariaCurrent?: ('page' | 'step' | 'location' | 'date' | 'time' | true) | null | undefined;
  /** Numeric count shown at the end of the item. */
  badge?: number | null;
  /** Shows an alert dot alongside the badge. */
  hasAlert?: boolean;
  /** Disables the item — non-navigable and styled as inactive. */
  disabled?: boolean;
  /** Emitted on click, carrying the `MouseEvent`. On an `href` item, `preventDefault()` intercepts navigation (e.g. a docs sidebar driving scroll-spy); a `routerLink` item navigates regardless — Angular's RouterLink ignores `defaultPrevented` — so treat it as a click hook there. */
  onActivate?: (value: MouseEvent) => void;
  /** Whether THIS item draws its edge marker when active. Unset follows the parent `ds-sidenav`, then on — the same "null means not deciding" reading as the rest of the library, so a sidenav-wide `[rail]="false"` is not fought per item. */
  rail?: boolean | null;
  /** Content for the `[icon]` slot. */
  iconContent?: React.ReactNode;
  /** Content for the `[trailing]` slot. */
  trailing?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const SidenavItem: React.ComponentType<SidenavItemProps>;
