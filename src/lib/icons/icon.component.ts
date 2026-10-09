import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { DS_ICON_REGISTRY } from './icon-registry';
import { ICONS, type IconName } from '@ids-group-ltd/ids-design-system/core';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';
import { reportDevWarning } from '@ids-group-ltd/ids-design-system/core';

/* Truncation contract:
   Glyph - Never clipped - the SVG sits in a square frame at one of the fixed sizes.
   Icon + text pair - Glyph fixed; text label takes the remaining width and clips with ellipsis. */

@Component({
  selector: 'ds-icon',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  // Host inline-flex + svg block prevents baseline-gap when icon sits next to text.
  styles: [
    `
      @layer ds-component-base {
        ds-icon,
        ds-icon * {
          box-sizing: border-box;
        }
      }
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
    const body =
      (ICONS as Record<string, string>)[key] ?? this.registry[key] ?? '';
    // IconName is open (`| (string & {})`) for consumer-registered names, so the type cannot catch a typo; this warning is the only check.
    if (!body) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        reportDevWarning(
          `[ds-icon] Unknown icon name "${key}" — not in the DS set and not registered through provideDsIcons(), so nothing renders.`,
        );
      }
    }

    return this.sanitizer.bypassSecurityTrustHtml(body);
  });
}
