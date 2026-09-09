import * as React from 'react';

/**
 * AuthLayout — the real AuthLayoutComponent, run by Angular behind `<ds-x-auth-layout>`.
 * Centred authentication shell — brand above a card, support links below. One `<main>` landmark for a sign-in, register or reset screen; nothing else on the page competes with it.
 */
export interface AuthLayoutProps {
  /** Wordmark beside the letter-mark tile. For a logo image/SVG, project it into the `[brand]` slot instead; for a two-tone wordmark use `[dsBrandName]`. Unset falls back to `DS_CONFIG.brand.name`. Each field resolves on its own, so `brand=""` drops the wordmark but a `logoLetter` in the config still paints its tile; clear both to give one screen no brand row. */
  brand?: string | null;
  /** Letter-mark glyph when it differs from the brand's first letter (e.g. an "A" tile beside the "AppAdmin" wordmark). Empty = first letter of `brand`; unset falls back to `DS_CONFIG.brand.logoLetter`. */
  logoLetter?: string | null;
  /** One line under the wordmark naming the product or audience. Unset falls back to `DS_CONFIG.brand.tagline`. */
  tagline?: string | null;
  /** Card treatment. `flat` suits a screen that already sits on a tinted canvas. */
  cardElevation?: ('flat' | 'raised' | 'hover' | 'interactive');
  /** Card padding, passed through to `ds-card`. `md` tightens a short form. */
  cardPadding?: ('none' | 'sm' | 'md' | 'lg');
  /** Announce the card as the page's `main` landmark. `ds-card` renders an `<article>`, which is NOT a landmark, so by default a screen-reader user has nothing to jump to — set `'main'` on a standalone auth page. Opt-in because the layout is also embedded inside pages that already own a `main`, and two `main`s is its own violation. */
  landmark?: 'main' | 'none';
  /** Content for the `[brand]` slot. */
  brandContent?: React.ReactNode;
  /** Content for the `[dsBrandName]` slot. */
  brandName?: React.ReactNode;
  /** Content for the `[dsAuthSupport]` slot. */
  authSupport?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const AuthLayout: React.ComponentType<AuthLayoutProps>;
