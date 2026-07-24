import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
} from '@angular/core';
import { BrandNameDirective } from './brand-name.directive';
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
   *  logo image/SVG, project it into the `[brand]` slot instead. */
  readonly brand = input<string>('');
  /** Letter-mark glyph when it differs from the brand's first letter (e.g. an
   *  "A" tile beside the "MyAdmin" wordmark). Empty = first letter of `brand`. */
  readonly logoLetter = input<string>('');

  /** Projected `[dsBrandName]` wordmark markup, when the consumer provides one. */
  protected readonly brandNameRef = contentChild(BrandNameDirective);
  protected readonly hasBrandName = computed(() => !!this.brandNameRef());
}
