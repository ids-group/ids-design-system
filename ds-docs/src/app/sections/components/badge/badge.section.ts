import { Component, ViewEncapsulation } from '@angular/core';
import { BadgeComponent, StatusDotComponent, TagComponent } from 'ds';
import { DocsTruncationComponent, TruncationRule } from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-badge',
  standalone: true,
  imports: [BadgeComponent, StatusDotComponent, TagComponent, DocsTruncationComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './badge.section.html',
  styleUrl: './badge.section.scss',
})
export class BadgeSection {
  protected readonly truncationRules: TruncationRule[] = [
    { field: 'Badge / tag label', behaviour: 'Single line, ellipsis at ~22 ch. Tooltip on hover when clipped.' },
    { field: 'Status pill', behaviour: 'No clip — lifecycle labels are fixed and short (Planning, Active, etc.).' },
    { field: 'w3w', behaviour: 'No clip — the three-word address is a fixed length.' },
  ];
}
