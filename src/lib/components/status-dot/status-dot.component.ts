import { Component, ViewEncapsulation, input } from '@angular/core';
import type { DsStatusKey } from '@ids-group-ltd/ids-design-system/core';

@Component({
  selector: 'ds-status-dot',
  standalone: true,
  template: `<span aria-hidden="true" class="status-dot"></span>`,
  styleUrl: './status-dot.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'img',
    '[attr.data-status]': 'status() || null',
    '[attr.aria-label]': 'ariaLabel() || status() || null',
  },
})
export class StatusDotComponent {
  /** Consumer-defined status key that colours the dot. */
  readonly status = input<DsStatusKey>();
  /** Human label for assistive tech; colour alone carries the status otherwise. */
  readonly ariaLabel = input<string | null>(null);
}
