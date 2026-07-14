import { Component, ViewEncapsulation } from '@angular/core';
import { BadgeComponent } from 'ds';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DocsSpecimensComponent } from '../../../shared/docs-specimens.component';

@Component({
  selector: 'section-components-badge',
  standalone: true,
  imports: [
    BadgeComponent,
    DocsTruncationComponent,
    DocsSectionComponent,
    DocsSpecimensComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './badge.section.html',
  styleUrls: ['./badge.section.scss', './badge.responsive.scss'],
})
export class BadgeSection {
  protected readonly lifecycleVariants: readonly string[] = [
    'planning',
    'confirmed',
    'active',
    'completed',
  ];

  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Badge / tag label',
      behaviour:
        'Single line, ellipsis at ~22 ch. Tooltip on hover when clipped.',
    },
    {
      field: 'Status pill',
      behaviour:
        'No clip — lifecycle labels are fixed and short (Planning, Active, etc.).',
    },
    {
      field: 'w3w',
      behaviour: 'No clip — the three-word address is a fixed length.',
    },
  ];
}
