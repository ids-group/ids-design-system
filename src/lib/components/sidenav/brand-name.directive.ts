import { Directive } from '@angular/core';

/**
 * Marks projected wordmark markup for `ds-sidenav`: when present, the sidenav
 * renders the projected content inside `.brand-name` instead of the plain
 * `brand` text (two-tone wordmarks, inline logos etc. stay consumer-side).
 */
@Directive({
  selector: '[dsBrandName]',
  standalone: true,
})
export class BrandNameDirective {}
