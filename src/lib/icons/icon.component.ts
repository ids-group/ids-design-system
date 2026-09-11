import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  isDevMode,
  numberAttribute,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { DS_ICON_REGISTRY } from './icon-registry';
import { ICONS, type IconName } from '@ids-group-ltd/ids-design-system/core';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';

/* Truncation contract:
   Glyph — Never clipped — the SVG sits in a square frame at one of the fixed sizes.
   Icon + text pair — Glyph fixed; text label takes the remaining width and clips with ellipsis. */

@Component({
  selector: 'ds-icon',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  // Host inline-flex + svg block prevents baseline-gap when icon sits next to text.
  styles: [
    `
      ds-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        vertical-align: middle;
        line-height: 0;
      }
      ds-icon > svg.icon {
        display: block;
      }
    `,
  ],
  templateUrl: './icon.component.html',
})
export class IconComponent {
  private readonly sanitizer = inject(DomSanitizer);
  // Consumer-supplied icons via provideDsIcons(...). Empty record by default.
  private readonly registry = inject(DS_ICON_REGISTRY);
  readonly name = input.required<IconName>();
  /** Pixel size of the square glyph. Unset falls back to `DS_CONFIG.icon.size`,
   *  then `16`. */
  readonly size = input<number | null, unknown>(null, {
    transform: (value) => (value == null ? null : numberAttribute(value)),
  });
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.icon?.size,
    16,
  );
  readonly stroke = input<number>(1.75);
  /** When set, the icon is exposed to assistive tech as an image with this
   *  name; otherwise it is decorative and hidden (`aria-hidden`). */
  readonly ariaLabel = input<string | null>(null);
  protected readonly paths = computed<SafeHtml>(() => {
    const key = this.name();
    // Built-in DS set wins over consumer registry — see provideDsIcons() docs.
    const body =
      (ICONS as Record<string, string>)[key] ?? this.registry[key] ?? '';
    // A misspelled name renders an empty <svg> and nothing else — no error, and
    // the type cannot catch it: IconName stays open (`| (string & {})`) so a
    // consumer can register their own through provideDsIcons(), and closing the
    // union would reject every registered name. This branch is the only place
    // that knows. Production pays one falsy check.
    if (!body && isDevMode()) {
      console.warn(
        `[ds-icon] Unknown icon name "${key}" — not in the DS set and not registered through provideDsIcons(), so nothing renders.`,
      );
    }

    return this.sanitizer.bypassSecurityTrustHtml(body);
  });
}
