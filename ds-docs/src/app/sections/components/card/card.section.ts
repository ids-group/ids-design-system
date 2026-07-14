import { Component, ViewEncapsulation } from '@angular/core';
import { CardComponent, type CardElevation, type CardPadding } from 'ds';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-card',
  standalone: true,
  imports: [CardComponent, DocsTruncationComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './card.section.html',
  styleUrls: ['./card.section.scss', './card.responsive.scss'],
})
export class CardSection {
  protected readonly elevations: readonly CardElevation[] = [
    'flat',
    'raised',
    'hover',
  ];
  protected readonly paddings: readonly CardPadding[] = ['sm', 'md', 'lg'];
  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Header title',
      behaviour:
        'Single line, ellipsis at ~32 ch. Tooltip on hover when clipped.',
    },
    {
      field: 'Body copy',
      behaviour:
        'Wrap freely. No line clamp by default; consumer applies clamp if needed.',
    },
    {
      field: 'Footer actions',
      behaviour: 'Stay below; collapse to icon-only on narrow widths.',
    },
  ];
}
