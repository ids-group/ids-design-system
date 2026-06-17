import { Component, ViewEncapsulation } from '@angular/core';
import { TagComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-tag',
  standalone: true,
  imports: [DocsSectionComponent, DocsTruncationComponent, TagComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './tag.section.html',
  styleUrl: './tag.section.scss',
})
export class TagSection {
  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Label',
      behaviour:
        'Single line, ellipsis at ~16 ch. Tooltip on hover when clipped.',
    },
  ];

  protected toggle(_site: string): void {
    // demo-only: real consumers flip their own selected state
  }
}
