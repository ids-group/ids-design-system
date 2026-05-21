import { Component, ViewEncapsulation, computed, input } from '@angular/core';

@Component({
  selector: 'ds-page-header',
  standalone: true,
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class PageHeaderComponent {
  readonly eyebrow = input<string>('');
  readonly title = input.required<string>();
  readonly sub = input<string>('');
  readonly compact = input<boolean>(false);
  readonly divider = input<boolean>(true);
  readonly metaDivider = input<boolean>(true);

  protected readonly classes = computed(() => {
    const parts = ['page-header'];
    if (this.compact()) parts.push('compact');
    if (this.divider()) parts.push('with-divider');
    if (this.metaDivider()) parts.push('with-meta-divider');
    return parts.join(' ');
  });
}
