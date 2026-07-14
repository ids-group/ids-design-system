import { Component, ViewEncapsulation } from '@angular/core';
import { TimelineComponent, TimelineItemComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-timeline',
  standalone: true,
  imports: [TimelineComponent, TimelineItemComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './timeline.section.html',
  styleUrls: ['../../../shared/section-demo.scss', '../../../shared/section-demo.responsive.scss'],
})
export class TimelineSection {}
