import { Component, ViewEncapsulation, inject, input } from '@angular/core';
import { DS_INTL, retainStyles } from '@ids-group-ltd/ids-design-system/core';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';

@Component({
  selector: 'ds-spinner',
  standalone: true,
  template: '',
  styleUrl: './spinner.component.scss',
  host: {
    role: 'status',
    '[attr.aria-label]': 'intl().spinner.label',
    '[class.sm]': "size() === 'sm'",
    '[class.lg]': "size() === 'lg'",
  },
  encapsulation: ViewEncapsulation.Emulated,
})
export class SpinnerComponent {
  protected readonly intl = inject(DS_INTL);

  /** Spinner size - sm/md/lg. */
  readonly size = input<DsSize>('md');

  constructor() {
    retainStyles(SpinnerComponent);
  }
}
