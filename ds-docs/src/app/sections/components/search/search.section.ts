import { Component, ViewEncapsulation, signal } from '@angular/core';
import { SearchComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-search',
  standalone: true,
  imports: [SearchComponent, DocsSectionComponent, DocsTruncationComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './search.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './search.section.scss'],
})
export class SearchSection {
  protected readonly debounced = signal('');

  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Query',
      behaviour:
        'Single line, no clip while focused. Ellipsis when blurred + overflowing.',
    },
    { field: 'Hint kbd', behaviour: 'No clip — fixed glyph length.' },
  ];
}
