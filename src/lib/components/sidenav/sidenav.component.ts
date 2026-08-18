import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
} from '@angular/core';
import { BrandNameDirective } from './brand-name.directive';
import { resolveBrandValue } from '../brand-defaults';
import { SIDENAV, type SidenavContract } from './sidenav.token';

@Component({
  selector: 'ds-sidenav',
  standalone: true,
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
  /** Brand text at the top of the rail (auto letter-mark + name). For a custom
   *  logo image/SVG, project it into the `[brand]` slot instead. Unset falls back
   *  to `DS_CONFIG.brand.name`. Each field resolves on its own, so `brand=""` drops
   *  the wordmark while a `logoLetter` in the config still paints its tile. */
  readonly brand = input<string | null>(null);
  /** Letter-mark glyph when it differs from the brand's first letter (e.g. an
   *  "A" tile beside the "MyAdmin" wordmark). Empty = first letter of `brand`;
   *  unset falls back to `DS_CONFIG.brand.logoLetter`. */
  readonly logoLetter = input<string | null>(null);

  /** The template must read THIS, never the input beside it — that one is null
   *  until bound, and the config default lives here. */
  protected readonly brandName = resolveBrandValue(this.brand, 'name');
  protected readonly letterGlyph = resolveBrandValue(
    this.logoLetter,
    'logoLetter',
  );

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
