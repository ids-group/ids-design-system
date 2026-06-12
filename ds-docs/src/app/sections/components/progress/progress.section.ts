import { Component, ViewEncapsulation } from '@angular/core';
import { ProgressComponent } from 'ds';

@Component({
  selector: 'section-components-progress',
  standalone: true,
  imports: [ProgressComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './progress.section.html',
  styleUrl: './progress.section.scss',
})
export class ProgressSection {}
