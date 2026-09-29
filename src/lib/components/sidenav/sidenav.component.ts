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
  /** Whether the ACTIVE item draws its edge marker, for the whole sidenav. An individual
   *  `ds-sidenav-item` can override it with its own `rail`. */
  readonly rail = input(true, { transform: booleanAttribute });
  /** Brand text at the top of the rail (auto letter-mark + name). Unset falls back to
   *  `DS_CONFIG.brand.name`. Each field resolves on its own: `brand=""` drops the
   *  wordmark while a configured `logoLetter` still paints its tile. */
  readonly brand = input<string | null>(null);
  /** Letter-mark glyph when it differs from the brand's first letter. Empty = first letter of `brand`;
   *  unset falls back to `DS_CONFIG.brand.logoLetter`. */
  readonly logoLetter = input<string | null>(null);
  /** Route the brand row links to. Unset leaves the row non-interactive. `RouterLink` is
   *  instantiated only once this is set, so an app with no router still renders. */
  readonly brandRoute = input<string | readonly unknown[] | null>(null);
  /** Accessible name for the brand link; unset names it "<brand>, home". Ignored
   *  while `brandRoute` is unset. */
  readonly brandLinkLabel = input<string | null>(null);

  /** Read these, not the inputs: the config default lives here. */
  readonly brandName = resolveBrandValue(this.brand, 'name');
  readonly letterGlyph = resolveBrandValue(this.logoLetter, 'logoLetter');

  /** Projected `[dsBrandName]` wordmark markup, when the consumer provides one. */
  protected readonly brandNameRef = contentChild(BrandNameDirective);
  protected readonly hasBrandName = computed(() => !!this.brandNameRef());

  /** Spread, not `charAt(0)`: that splits an astral character's surrogate pair. */
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
