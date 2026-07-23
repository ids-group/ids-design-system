import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
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
  /** Leading slice of the wordmark tinted with the mark colour (e.g. "My" in
   *  "MyAdmin"); the remainder renders in the default text colour. Empty (or
   *  not a prefix of `brand`) = single-tone wordmark. */
  readonly brandAccent = input<string>('');

  /** Wordmark split when `brandAccent` is a real prefix of `brand`, else null. */
  protected readonly accentParts = computed(() => {
    const brand = this.brand();
    const accent = this.brandAccent();
    if (!accent || !brand.startsWith(accent)) {
      return null;
    }

    return { accent, rest: brand.slice(accent.length) };
  });
}
