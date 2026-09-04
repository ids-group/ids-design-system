import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { ButtonGroupComponent } from 'ds/button-group';
import { SegmentedComponent, SegmentedOption } from 'ds/segmented';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-segmented',
  standalone: true,
  imports: [
    DocsSectionComponent,
    SegmentedComponent,
    ButtonGroupComponent,
    ButtonComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './segmented.section.html',
  styleUrl: '../../../shared/section-demo.scss',
})
export class SegmentedSection {
  protected readonly view = signal('list');
  protected readonly viewOptions: SegmentedOption[] = [
    { label: 'List', value: 'list' },
    { label: 'Board', value: 'board' },
    { label: 'Calendar', value: 'calendar' },
  ];
}
