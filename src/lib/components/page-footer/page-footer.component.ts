import { Component, ViewEncapsulation, input } from '@angular/core';
import type { PageFooterVariant } from './page-footer.types';

@Component({
  selector: 'ds-page-footer',
  standalone: true,
  imports: [],
  templateUrl: './page-footer.component.html',
  styleUrl: './page-footer.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.compact]': "variant() === 'compact'",
    '[class.save]': "variant() === 'save'",
  },
})
export class PageFooterComponent {
  /** Visual style: default, compact, or the accented `save`-bar look. */
  readonly variant = input<PageFooterVariant>('default');
}
