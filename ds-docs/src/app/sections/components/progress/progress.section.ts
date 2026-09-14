import { Component, ViewEncapsulation } from '@angular/core';
import { ProgressComponent } from 'ds/progress';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-progress',
  standalone: true,
  imports: [ProgressComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './progress.section.html',
  styleUrl: './progress.section.scss',
})
export class ProgressSection {}
