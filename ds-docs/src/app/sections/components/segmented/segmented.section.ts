import { Component, ViewEncapsulation, signal } from '@angular/core';
import {
  SegmentedComponent,
  SegmentedOption,
  ButtonGroupComponent,
  ButtonComponent,
} from 'ds';
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
  styleUrls: ['../../../shared/section-demo.scss', '../../../shared/section-demo.responsive.scss'],
})
export class SegmentedSection {
  protected readonly view = signal('list');
  protected readonly viewOptions: SegmentedOption[] = [
    { label: 'List', value: 'list' },
    { label: 'Board', value: 'board' },
    { label: 'Calendar', value: 'calendar' },
  ];
}
