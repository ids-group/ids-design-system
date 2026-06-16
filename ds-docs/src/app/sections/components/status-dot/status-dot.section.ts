import { Component, ViewEncapsulation } from '@angular/core';
import { StatusDotComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DocsTruncationComponent, TruncationRule } from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-status-dot',
  standalone: true,
  imports: [StatusDotComponent, DocsSectionComponent, DocsTruncationComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './status-dot.section.html',
  styleUrl: './status-dot.section.scss',
})
export class StatusDotSection {
  protected readonly truncationRules: TruncationRule[] = [
    { field: 'Status pill', behaviour: 'No clip — lifecycle labels are fixed and short (Planning, Active, etc.).' },
  ];
}
