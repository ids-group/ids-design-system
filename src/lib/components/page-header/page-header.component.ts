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
  // A static `title="..."` also stays in the DOM as the global attribute and would make the host a native tooltip.
  host: { '[attr.title]': 'null' },
  encapsulation: ViewEncapsulation.Emulated,
})
export class PageHeaderComponent {
  /** Small label shown above the title. */
  readonly eyebrow = input<string>('');
  /** Page title, rendered as the `h1`. */
  readonly title = input<string>('');
  /** Supporting line shown under the title. */
  readonly subtitle = input<string>('');
  /** Tightens spacing for dense layouts. */
  readonly compact = input(false, { transform: booleanAttribute });
  /** Shows a rule under the whole header. */
  readonly divider = input(false, { transform: booleanAttribute });
  /** Shows a rule under the meta row only. */
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
