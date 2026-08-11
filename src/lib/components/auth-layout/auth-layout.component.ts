import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  contentChild,
  input,
} from '@angular/core';
import { CardComponent } from '../card/card.component';
import type { CardElevation, CardPadding } from '../card/card.types';
import { BrandNameDirective } from '../sidenav/brand-name.directive';
import { resolveBrandValue } from '../brand-defaults';

/**
 * Scaffold for the UNauthenticated screens — sign-in, forgot password, reset,
 * MFA — and the counterpart to `ds-app-layout`, which only ever covers the
 * screens behind the login.
 *
 * Brand row, tagline, card and support footer are the same four parts in every
 * consumer that has hand-rolled this. What the ports get wrong is the full-height
 * box: they nest a `100vh` wrapper inside a `100dvh` one and scroll a page whose
 * content fits. Here the host is the only one, and it also carries the safe-area
 * insets a notched phone in landscape needs.
 *
 * The brand row takes the same CONTRACT as `ds-sidenav` — a `brand` string gets a
 * letter-mark tile plus wordmark, `logoLetter` overrides the glyph, `[dsBrandName]`
 * projects a two-tone wordmark (import `BrandNameDirective` alongside this
 * component, or the attribute is inert and the wordmark lands in the card), and
 * `[brand]` projects a real logo. The two are not pixel-identical: the rail's tile
 * is a fixed 28px at weight 800, this one 24-32px at 700, and each has its own
 * `--ds-*-mark-*` hooks, so retinting the mark means setting both.
 *
 * Projecting into `[brand]` does NOT suppress the tile — leave `brand`/`logoLetter`
 * unset when you supply a logo.
 *
 * ```html
 * <ds-auth-layout brand="MyAdmin" logoLetter="A" tagline="Broker administration">
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
  /** Wordmark beside the letter-mark tile. For a logo image/SVG, project it into
   *  the `[brand]` slot instead; for a two-tone wordmark use `[dsBrandName]`.
   *  Unset falls back to `DS_CONFIG.brand.name` — six auth screens answer this
   *  identically. Each field resolves on its own, so `brand=""` drops the wordmark
   *  but a `logoLetter` in the config still paints its tile; clear both to give one
   *  screen no brand row. */
  readonly brand = input<string | null>(null);
  /** Letter-mark glyph when it differs from the brand's first letter (e.g. an
   *  "A" tile beside the "MyAdmin" wordmark). Empty = first letter of `brand`;
   *  unset falls back to `DS_CONFIG.brand.logoLetter`. */
  readonly logoLetter = input<string | null>(null);
  /** One line under the wordmark naming the product or audience. Unset falls back
   *  to `DS_CONFIG.brand.tagline`. */
  readonly tagline = input<string | null>(null);

  /** What the template renders: the input, or the app-level default behind it. */
  protected readonly brandName = resolveBrandValue(this.brand, 'name');
  protected readonly letterGlyph = resolveBrandValue(
    this.logoLetter,
    'logoLetter',
  );
  protected readonly taglineText = resolveBrandValue(this.tagline, 'tagline');
  /** Card treatment. `flat` suits a screen that already sits on a tinted canvas. */
  readonly cardElevation = input<CardElevation>('raised');
  /** Card padding, passed through to `ds-card`. `md` tightens a short form. */
  readonly cardPadding = input<CardPadding>('lg');
  /** Announce the card as the page's `main` landmark. The card holds the whole
   *  content of an auth screen and `ds-card` renders an `<article>`, which is NOT
   *  a landmark, so by default a screen-reader user has nothing to jump to — set
   *  this to `'main'` on a standalone auth page. It is opt-in because the layout
   *  is also embedded inside pages that already own a `main` (this repo's own docs
   *  site nests it inside `ds-app-layout`), and two `main`s is its own violation.
   *  Defaulting it to `'main'` is the better end state and belongs in the next
   *  batch of default changes. */
  readonly landmark = input<'main' | 'none'>('none');

  /** Projected `[dsBrandName]` wordmark markup, when the consumer provides one. */
  protected readonly brandNameRef = contentChild(BrandNameDirective);
  protected readonly hasBrandName = computed(() => !!this.brandNameRef());

  /** Spread, not `charAt(0)`: the latter indexes UTF-16 code UNITS, so a brand
   *  starting with an astral character (an emoji, a rarer CJK glyph) yields half
   *  a surrogate pair and paints as tofu. */
  protected readonly markGlyph = computed(
    () => this.letterGlyph() || [...this.brandName()][0] || '',
  );
}
