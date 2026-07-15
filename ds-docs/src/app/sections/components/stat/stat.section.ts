import { Component, ViewEncapsulation } from '@angular/core';
import { StatComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-stat',
  standalone: true,
  imports: [StatComponent, DocsSectionComponent, DocsTruncationComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './stat.section.html',
  styleUrl: './stat.section.scss',
})
export class StatSection {
  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Stat label',
      behaviour: 'Single line, ellipsis. Tooltip on hover when clipped.',
    },
    {
      field: 'Stat value',
      behaviour:
        'No clip. Use compact notation (₤ 1.2k) before letting numbers wrap.',
    },
  ];
}
