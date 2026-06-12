import { Component, ViewEncapsulation, signal } from '@angular/core';
import { PaginationComponent, IconComponent } from 'ds';

@Component({
  selector: 'section-components-pagination',
  standalone: true,
  imports: [PaginationComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './pagination.section.html',
  styleUrl: './pagination.section.scss',
})
export class PaginationSection {
  protected readonly pageDefault = signal(4);
  protected readonly pageWith = signal(3);
  protected readonly pageSizeWith = signal(20);
}
