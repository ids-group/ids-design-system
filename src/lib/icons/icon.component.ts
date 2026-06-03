import { Component, ViewEncapsulation, computed, inject, input } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { DS_ICON_REGISTRY } from './icon-registry';
import { ICONS, type IconName } from './icons.data';

@Component({
  selector: 'ds-icon',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  // Host inline-flex + svg block prevents baseline-gap when icon sits next to text.
  styles: [`
    ds-icon { display: inline-flex; align-items: center; justify-content: center; vertical-align: middle; line-height: 0; }
    ds-icon > svg.icon { display: block; }
  `],
  template: `
    <svg
      class="icon"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="stroke()"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.role]="ariaLabel() ? 'img' : null"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-hidden]="ariaLabel() ? null : 'true'"
      [innerHTML]="paths()"
    ></svg>
  `,
})
export class IconComponent {
  private readonly sanitizer = inject(DomSanitizer);
  // Consumer-supplied icons via provideDsIcons(...). Empty record by default.
  private readonly registry = inject(DS_ICON_REGISTRY);
  readonly name = input.required<IconName>();
  readonly size = input<number>(16);
  readonly stroke = input<number>(1.75);
  /** When set, the icon is exposed to assistive tech as an image with this
   *  name; otherwise it is decorative and hidden (`aria-hidden`). */
  readonly ariaLabel = input<string | null>(null);
  protected readonly paths = computed<SafeHtml>(() => {
    const key = this.name();
    // Built-in DS set wins over consumer registry — see provideDsIcons() docs.
    const body = (ICONS as Record<string, string>)[key] ?? this.registry[key] ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(body);
  });
}
