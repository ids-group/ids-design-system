import { Component, ViewEncapsulation, signal } from '@angular/core';
import { IconComponent, ListComponent, ListItemComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-list',
  standalone: true,
  imports: [
    IconComponent,
    ListComponent,
    ListItemComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './list.section.html',
  styleUrl: '../../../shared/section-demo.scss',
})
export class ListSection {
  protected readonly selectedItem = signal<string | null>('notifications');
}
