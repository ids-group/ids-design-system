import * as React from 'react';

/**
 * Sidenav — the real SidenavComponent, run by Angular behind `<ds-x-sidenav>`.
 * Vertical navigation rail — port of `ds-sidenav`. Flex column with a brand row on top; compose `SidenavGroup`/`SidenavItem` children (and optionally a `SidenavFooter` last — it pins itself to the bottom).
 */
export interface SidenavProps {
  /** Collapses the rail to icon-only width; read by nested `ds-sidenav-item`/`ds-sidenav-group`. */
  collapsed?: boolean;
  /** Whether the ACTIVE item draws its edge marker, for the whole sidenav. Off leaves the active state on the fill and the label alone — check that is still distinguishable before turning it off. An individual `ds-sidenav-item` can override this with its own `rail`. */
  rail?: boolean;
  /** Brand text at the top of the rail (auto letter-mark + name). For a custom logo image/SVG, project it into the `[brand]` slot instead. Unset falls back to `DS_CONFIG.brand.name`. Each field resolves on its own, so `brand=""` drops the wordmark while a `logoLetter` in the config still paints its tile. */
  brand?: string | null;
  /** Letter-mark glyph when it differs from the brand's first letter (e.g. an "A" tile beside the "AppAdmin" wordmark). Empty = first letter of `brand`; unset falls back to `DS_CONFIG.brand.logoLetter`. */
  logoLetter?: string | null;
  /** Route the brand row links to — typically the app's home. Unset leaves the row a plain, non-interactive block. Router targets only, and `RouterLink` is instantiated only once this is set, so an app with no router still renders. */
  brandRoute?: string | readonly unknown[] | null;
  /** Accessible name for the brand link; unset names it "<brand>, home". Ignored while `brandRoute` is unset. */
  brandLinkLabel?: string | null;
  /** Content for the `[brand]` slot. */
  brandContent?: React.ReactNode;
  /** Content for the `[dsBrandName]` slot. */
  brandName?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Sidenav: React.ComponentType<SidenavProps>;
