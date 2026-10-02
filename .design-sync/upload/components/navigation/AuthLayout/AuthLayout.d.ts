import * as React from 'react';

/**
 * AuthLayout — the real AuthLayoutComponent, run by Angular behind `<ds-x-auth-layout>`.
 * Centred authentication shell — brand above a card, support links below. One `<main>` landmark for a sign-in, register or reset screen; nothing else on the page competes with it.
 */
export interface AuthLayoutProps {
  /** Wordmark beside the letter-mark tile. Unset falls back to `DS_CONFIG.brand.name`. Each field resolves on its own: `brand=""` drops the wordmark but a configured `logoLetter` still paints its tile; clear both for no brand row. */
  brand?: string | null;
  /** Letter-mark glyph when it differs from the brand's first letter. Empty = first letter of `brand`; unset falls back to `DS_CONFIG.brand.logoLetter`. */
  logoLetter?: string | null;
  /** One line under the wordmark. Unset falls back to `DS_CONFIG.brand.tagline`. */
  tagline?: string | null;
  /** Card elevation. */
  cardElevation?: ('flat' | 'raised' | 'hover' | 'interactive');
  /** Card padding, passed through to `ds-card`. */
  cardPadding?: ('none' | 'sm' | 'md' | 'lg');
  /** Announces the card as the page's `main` landmark (`ds-card` renders an `<article>`). Set `'none'` inside a page that already owns a `main`, such as `ds-app-layout`. */
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
