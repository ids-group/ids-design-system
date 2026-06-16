import { Component, ViewEncapsulation } from '@angular/core';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DocsTruncationComponent, TruncationRule } from '../../../shared/docs-truncation.component';

interface ScrollToken {
  readonly token: string;
  readonly use: string;
}

const TOKENS: readonly ScrollToken[] = [
  { token: '--scrollbar-w',            use: '10 px — global scrollbar width' },
  { token: '--scrollbar-thumb',        use: 'Thumb at rest (neutral-300 light / neutral-600 dark)' },
  { token: '--scrollbar-thumb-hover',  use: 'Thumb on hover (neutral-400)' },
  { token: '--scrollbar-thumb-active', use: 'Thumb while dragging (neutral-500)' },
];

@Component({
  selector: 'section-foundations-scrollbar',
  standalone: true,
  imports: [DocsSectionComponent, DocsTruncationComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './scrollbar.section.html',
  styleUrl: './scrollbar.section.scss',
})
export class ScrollbarSection {
  protected readonly tokens = TOKENS;
  protected readonly rows = Array.from({ length: 30 }, (_, i) => i + 1);
  protected readonly cols = Array.from({ length: 12 }, (_, i) => i + 1);

  protected readonly truncationRules: TruncationRule[] = [
    { field: 'Scroll-pane content', behaviour: 'Never clipped horizontally — the pane scrolls instead. Rows wrap inside the pane.' },
    { field: 'Row label', behaviour: 'Single line, ellipsis. Long labels truncate before causing horizontal scroll inside a vertical pane.' },
    { field: 'Horizontal column', behaviour: 'Fixed width; pane scrolls horizontally to reveal more columns.' },
  ];

  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }
}
