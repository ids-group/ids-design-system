import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'ds-page-header',
  standalone: true,
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class PageHeaderComponent {
  readonly eyebrow = input<string>('');
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly compact = input(false, { transform: booleanAttribute });
  readonly divider = input(false, { transform: booleanAttribute });
  readonly metaDivider = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => {
    const parts = ['page-header'];
    if (this.compact()) {
      parts.push('compact');
    }
    if (this.divider()) {
      parts.push('with-divider');
    }
    if (this.metaDivider()) {
      parts.push('with-meta-divider');
    }

    return parts.join(' ');
  });
}
