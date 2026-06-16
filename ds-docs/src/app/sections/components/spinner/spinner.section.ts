import { Component, ViewEncapsulation } from '@angular/core';
import { SpinnerComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-spinner',
  standalone: true,
  imports: [SpinnerComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './spinner.section.html',
  styleUrl: './spinner.section.scss',
})
export class SpinnerSection {}
