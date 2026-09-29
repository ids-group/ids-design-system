import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  contentChild,
  input,
} from '@angular/core';
import { CardComponent } from '@ids-group-ltd/ids-design-system/components/card';
import type {
  CardElevation,
  CardPadding,
} from '@ids-group-ltd/ids-design-system/core';
import { BrandNameDirective } from '@ids-group-ltd/ids-design-system/components/sidenav';
import { resolveBrandValue } from '@ids-group-ltd/ids-design-system/components';

/**
 * Scaffold for the UNauthenticated screens (sign-in, forgot password, reset,
 * MFA); the counterpart to `ds-app-layout`.
 *
 * The host is the ONLY full-height box (a nested `100vh` wrapper would scroll a
 * page whose content fits) and carries the safe-area insets.
 *
 * The brand row takes the same CONTRACT as `ds-sidenav`: a `brand` string gets a
 * letter-mark tile plus wordmark, `logoLetter` overrides the glyph, `[dsBrandName]`
 * projects a two-tone wordmark (import `BrandNameDirective` alongside this
 * component, or the attribute is inert and the wordmark lands in the card), and
 * `[brand]` projects a real logo. Each has its own `--ds-*-mark-*` hooks, so
 * retinting the mark means setting both.
 *
 * Projecting into `[brand]` does NOT suppress the tile; leave `brand`/`logoLetter`
 * unset when you supply a logo.
 *
 * ```html
 * <ds-auth-layout brand="AppAdmin" logoLetter="A" tagline="Workspace administration">
 *   <h1 class="title">Sign in</h1>
 *   <form class="form">…</form>
 *
 *   <p dsAuthSupport>
 *     Need a hand? <a href="mailto:support@example.com">Contact support</a>
 *   </p>
 * </ds-auth-layout>
 * ```
 */
@Component({
  selector: 'ds-auth-layout',
  standalone: true,
  imports: [CardComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {
  /** Wordmark beside the letter-mark tile. Unset falls back to `DS_CONFIG.brand.name`.
   *  Each field resolves on its own: `brand=""` drops the wordmark but a configured
   *  `logoLetter` still paints its tile; clear both for no brand row. */
  readonly brand = input<string | null>(null);
  /** Letter-mark glyph when it differs from the brand's first letter. Empty = first letter of `brand`;
   *  unset falls back to `DS_CONFIG.brand.logoLetter`. */
  readonly logoLetter = input<string | null>(null);
  /** One line under the wordmark. Unset falls back to `DS_CONFIG.brand.tagline`. */
  readonly tagline = input<string | null>(null);

  /** Read these, not the inputs: the config default lives here. */
  readonly brandName = resolveBrandValue(this.brand, 'name');
  readonly letterGlyph = resolveBrandValue(this.logoLetter, 'logoLetter');
  readonly taglineText = resolveBrandValue(this.tagline, 'tagline');
  /** Card elevation. */
  readonly cardElevation = input<CardElevation>('raised');
  /** Card padding, passed through to `ds-card`. */
  readonly cardPadding = input<CardPadding>('lg');
  /** Announces the card as the page's `main` landmark (`ds-card` renders an `<article>`).
   *  Set `'none'` inside a page that already owns a `main`, such as `ds-app-layout`. */
  readonly landmark = input<'main' | 'none'>('main');

  protected readonly brandNameRef = contentChild(BrandNameDirective);
  protected readonly hasBrandName = computed(() => !!this.brandNameRef());

  /** Spread, not `charAt(0)`: that splits an astral character's surrogate pair. */
  protected readonly markGlyph = computed(
    () => this.letterGlyph() || [...this.brandName()][0] || '',
  );
}
