import { Component, ViewEncapsulation } from '@angular/core';
import { RadioComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-radio',
  standalone: true,
  imports: [DocsSectionComponent, RadioComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './radio.section.html',
  styleUrl: './radio.section.scss',
})
export class RadioSection {}
