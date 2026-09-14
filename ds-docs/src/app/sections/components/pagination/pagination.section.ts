import { Component, ViewEncapsulation, signal } from '@angular/core';
import { PaginationComponent } from 'ds/pagination';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-pagination',
  standalone: true,
  imports: [PaginationComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './pagination.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './pagination.section.scss'],
})
export class PaginationSection {
  protected readonly pageDefault = signal(4);
  protected readonly pageWith = signal(3);
  protected readonly pageSizeWith = signal(20);
}
