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
 * The brand row follows `ds-sidenav`: a `brand` string gets a letter-mark tile
 * plus wordmark, `logoLetter` overrides the glyph, `[dsBrandName]` projects a
 * two-tone wordmark, and `[brand]` projects a real logo instead of the tile.
 *
 * ```html
 * <ds-auth-shell brand="MyAdmin" logoLetter="A" tagline="Broker administration">
 *   <h1 class="title">Sign in</h1>
 *   <form class="form">…</form>
 *
 *   <p dsAuthSupport>
 *     Need a hand? <a href="mailto:support@example.com">Contact support</a>
 *   </p>
 * </ds-auth-shell>
 * ```
 */
@Component({
  selector: 'ds-auth-shell',
  standalone: true,
  imports: [CardComponent],
  templateUrl: './auth-shell.component.html',
  styleUrl: './auth-shell.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthShellComponent {
  /** Wordmark beside the letter-mark tile. For a logo image/SVG, project it into
   *  the `[brand]` slot instead; for a two-tone wordmark use `[dsBrandName]`. */
  readonly brand = input<string>('');
  /** Letter-mark glyph when it differs from the brand's first letter (e.g. an
   *  "A" tile beside the "MyAdmin" wordmark). Empty = first letter of `brand`. */
  readonly logoLetter = input<string>('');
  /** One line under the wordmark naming the product or audience. */
  readonly tagline = input<string>('');
  /** Card treatment. `flat` suits a screen that already sits on a tinted canvas. */
  readonly cardElevation = input<CardElevation>('raised');
  /** Card padding, passed through to `ds-card`. `md` tightens a short form. */
  readonly cardPadding = input<CardPadding>('lg');

  /** Projected `[dsBrandName]` wordmark markup, when the consumer provides one. */
  protected readonly brandNameRef = contentChild(BrandNameDirective);
  protected readonly hasBrandName = computed(() => !!this.brandNameRef());
}
