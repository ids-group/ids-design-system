import { Directive } from '@angular/core';

/**
 * Marks projected wordmark markup for `ds-sidenav`: when present, the sidenav
 * renders the projected content inside `.brand-name` instead of the plain
 * `brand` text (two-tone wordmarks, inline logos etc. stay consumer-side).
 *
 * Interplay: projecting `[dsBrandName]` is enough to render the brand row and
 * its wordmark even without a string `brand`, but it only supplies the
 * wordmark — the letter-mark tile still comes from `logoLetter` (or the first
 * letter of `brand`), so an empty `brand` + projection renders the wordmark
 * with no tile.
 */
@Directive({
  selector: '[dsBrandName]',
  standalone: true,
})
export class BrandNameDirective {}
