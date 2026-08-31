import { Component, ViewEncapsulation, signal } from '@angular/core';
import {
  CheckboxComponent,
  IconButtonComponent,
  IconComponent,
  ListComponent,
  ListItemComponent,
} from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-list',
  standalone: true,
  imports: [
    CheckboxComponent,
    IconButtonComponent,
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

  protected readonly carriers = [
    'Northbound Freight',
    'Halden Logistics',
    'Kestrel Haulage',
  ];
  protected readonly viewing = signal<string>('Halden Logistics');
  protected readonly picked = signal<ReadonlySet<string>>(
    new Set(['Northbound Freight']),
  );

  protected toggleCarrier(name: string): void {
    this.picked.update((set) => {
      const next = new Set(set);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }

      return next;
    });
  }
}
