import { Component, ViewEncapsulation, signal } from '@angular/core';
import { InlineEditComponent } from 'ds/inline-edit';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-inline-edit',
  standalone: true,
  imports: [DocsSectionComponent, InlineEditComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './inline-edit.section.html',
  styleUrls: [
    '../../../shared/section-demo.scss',
    './inline-edit.section.scss',
  ],
})
export class InlineEditSection {
  protected readonly title = signal('Pricing page redesign');
  protected readonly log = signal<string[]>([]);

  protected record(value: string): void {
    this.log.update((log) => [...log, value]);
  }
}
