import { Component, ViewEncapsulation, signal } from '@angular/core';
import { PaginationComponent } from 'ds';
import { DocsTruncationComponent, TruncationRule } from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-pagination',
  standalone: true,
  imports: [PaginationComponent, DocsTruncationComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './pagination.section.html',
  styleUrl: './pagination.section.scss',
})
export class PaginationSection {
  protected readonly pageDefault = signal(4);
  protected readonly pageWith = signal(3);
  protected readonly pageSizeWith = signal(20);

  protected readonly truncationRules: TruncationRule[] = [
    { field: 'Page number', behaviour: 'Single digit / short numeral — no clip ever.' },
    { field: 'Ellipsis', behaviour: 'Three dots only — no clip.' },
    { field: 'Total count', behaviour: 'Plain text — wraps in narrow viewports.' },
  ];
}
