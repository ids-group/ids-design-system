import { Component, ViewEncapsulation } from '@angular/core';
import { ProgressComponent } from 'ds';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-progress',
  standalone: true,
  imports: [ProgressComponent, DocsTruncationComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './progress.section.html',
  styleUrl: './progress.section.scss',
})
export class ProgressSection {
  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Value',
      behaviour:
        'Clamped to 0..100 in the wrapper. Pass percentages, not absolute counts.',
    },
    {
      field: 'Indeterminate',
      behaviour:
        'Width input is ignored. Animation runs at --duration-loop-slow.',
    },
  ];
}
