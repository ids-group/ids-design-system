import { Component, ViewEncapsulation } from '@angular/core';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface ScrollToken {
  readonly token: string;
  readonly use: string;
}

const TOKENS: readonly ScrollToken[] = [
  { token: '--scrollbar-w', use: '10 px — global scrollbar width' },
  {
    token: '--scrollbar-thumb',
    use: 'Thumb at rest (neutral-300 light / neutral-600 dark)',
  },
  { token: '--scrollbar-thumb-hover', use: 'Thumb on hover (neutral-400)' },
  {
    token: '--scrollbar-thumb-active',
    use: 'Thumb while dragging (neutral-500)',
  },
];

@Component({
  selector: 'section-foundations-scrollbar',
  standalone: true,
  imports: [DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './scrollbar.section.html',
  styleUrl: './scrollbar.section.scss',
})
export class ScrollbarSection {
  protected readonly tokens = TOKENS;
  protected readonly rows = Array.from({ length: 30 }, (_, i) => i + 1);
  protected readonly cols = Array.from({ length: 12 }, (_, i) => i + 1);

  protected pad(num: number): string {
    return String(num).padStart(2, '0');
  }
}
