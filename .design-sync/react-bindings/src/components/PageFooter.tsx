import * as React from 'react';
import { cx, host } from '../lib/util';

export type PageFooterVariant = 'default' | 'compact' | 'save';

export interface PageFooterProps {
  /** Visual style — default, compact, or the accented `save`-bar look. */
  variant?: PageFooterVariant;
  /** Leading identity/summary text (the `[brand]` slot). */
  brand?: React.ReactNode;
  /** Link row (the `[nav]` slot) — typically a `<nav>` of quiet links. */
  nav?: React.ReactNode;
  /** Trailing buttons (the `[actions]` slot). Wrap multiple buttons in one
   *  flex container — every slot node is a direct flex child of the host. */
  actions?: React.ReactNode;
  /** Any extra content (the default slot), rendered after the named slots. */
  children?: React.ReactNode;
}

/** Page-bottom row — port of `ds-page-footer`. The host itself is the flex
 *  row (`space-between`, wrap): `default` is a plain border-top spread,
 *  `compact` a subtle card, `save` a brand-tinted unsaved-changes bar. */
export function PageFooter({
  variant = 'default',
  brand,
  nav,
  actions,
  children,
}: PageFooterProps) {
  return host(
    'ds-page-footer',
    {
      class:
        cx(variant === 'compact' && 'compact', variant === 'save' && 'save') ||
        undefined,
    },
    brand,
    nav,
    actions,
    children,
  );
}
