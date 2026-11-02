import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import {
  TimelineComponent,
  TimelineItemComponent,
  type TimelineStatus,
} from 'ds/timeline';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-timeline',
  standalone: true,
  imports: [
    ButtonComponent,
    TimelineComponent,
    TimelineItemComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './timeline.section.html',
  styleUrl: '../../../shared/section-demo.scss',
})
export class TimelineSection {
  protected readonly wrappedSteps: readonly {
    heading: string;
    time: string;
    status: TimelineStatus;
  }[] = [
    { heading: 'Import the brief', time: '09:41', status: 'done' },
    { heading: 'Generate screens', time: '09:42', status: 'done' },
    { heading: 'Publish the prototype', time: 'Running', status: 'running' },
  ];
}
