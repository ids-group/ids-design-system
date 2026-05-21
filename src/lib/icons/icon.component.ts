import { Component, ViewEncapsulation, computed, inject, input } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
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
      [innerHTML]="paths()"
    ></svg>
  `,
})
export class IconComponent {
  private readonly sanitizer = inject(DomSanitizer);
  readonly name = input.required<IconName>();
  readonly size = input<number>(16);
  readonly stroke = input<number>(1.75);
  protected readonly paths = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(ICONS[this.name()]),
  );
}
