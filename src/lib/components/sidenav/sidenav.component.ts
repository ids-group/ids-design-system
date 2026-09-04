import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BrandNameDirective } from './brand-name.directive';
import { resolveBrandValue } from '@ids-group-ltd/ids-design-system/components';
import { SIDENAV, type SidenavContract } from './sidenav.token';

@Component({
  selector: 'ds-sidenav',
  standalone: true,
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.sidenav]': 'true',
    '[class.collapsed]': 'collapsed()',
  },
  providers: [{ provide: SIDENAV, useExisting: SidenavComponent }],
})
export class SidenavComponent implements SidenavContract {
  /** Collapses the rail to icon-only width; read by nested `ds-sidenav-item`/`ds-sidenav-group`. */
  readonly collapsed = input(false, { transform: booleanAttribute });
  /** Whether the ACTIVE item draws its edge marker, for the whole sidenav. Off
   *  leaves the active state on the fill and the label alone — check that is still
   *  distinguishable before turning it off. An individual `ds-sidenav-item` can
   *  override this with its own `rail`. */
  readonly rail = input(true, { transform: booleanAttribute });
  /** Brand text at the top of the rail (auto letter-mark + name). For a custom
   *  logo image/SVG, project it into the `[brand]` slot instead. Unset falls back
   *  to `DS_CONFIG.brand.name`. Each field resolves on its own, so `brand=""` drops
   *  the wordmark while a `logoLetter` in the config still paints its tile. */
  readonly brand = input<string | null>(null);
  /** Letter-mark glyph when it differs from the brand's first letter (e.g. an
   *  "A" tile beside the "MyAdmin" wordmark). Empty = first letter of `brand`;
   *  unset falls back to `DS_CONFIG.brand.logoLetter`. */
  readonly logoLetter = input<string | null>(null);
  /** Route the brand row links to — typically the app's home. Unset leaves the row a
   *  plain, non-interactive block. Router targets only, and `RouterLink` is
   *  instantiated only once this is set, so an app with no router still renders. */
  readonly brandRoute = input<string | readonly unknown[] | null>(null);
  /** Accessible name for the brand link; unset names it "<brand>, home". Ignored
   *  while `brandRoute` is unset. */
  readonly brandLinkLabel = input<string | null>(null);

  /** The template must read THIS, never the input beside it — that one is null
   *  until bound, and the config default lives here. */
  readonly brandName = resolveBrandValue(this.brand, 'name');
  readonly letterGlyph = resolveBrandValue(this.logoLetter, 'logoLetter');

  /** Projected `[dsBrandName]` wordmark markup, when the consumer provides one. */
  protected readonly brandNameRef = contentChild(BrandNameDirective);
  protected readonly hasBrandName = computed(() => !!this.brandNameRef());

  /** Spread, not `charAt(0)`: the latter indexes UTF-16 code UNITS, so a brand
   *  starting with an astral character (an emoji, a rarer CJK glyph) yields half
   *  a surrogate pair and paints as tofu. */
  protected readonly markGlyph = computed(
    () => this.letterGlyph() || [...this.brandName()][0] || '',
  );

  protected readonly brandAriaLabel = computed(() => {
    const own = this.brandLinkLabel();
    if (own) {
      return own;
    }
    const name = this.brandName();

    return name ? `${name}, home` : 'Home';
  });
}
