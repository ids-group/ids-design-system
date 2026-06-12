import { Component, ViewEncapsulation } from '@angular/core';
import { SpinnerComponent } from 'ds';

@Component({
  selector: 'section-components-spinner',
  standalone: true,
  imports: [SpinnerComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './spinner.section.html',
  styleUrl: './spinner.section.scss',
})
export class SpinnerSection {}
