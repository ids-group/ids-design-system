import { Component, ViewEncapsulation } from '@angular/core';
import { TimelineComponent, TimelineItemComponent } from 'ds/timeline';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-timeline',
  standalone: true,
  imports: [TimelineComponent, TimelineItemComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './timeline.section.html',
  styleUrl: '../../../shared/section-demo.scss',
})
export class TimelineSection {}
