import { Component, ViewEncapsulation, signal } from '@angular/core';
import { NumberStepperComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-number-stepper',
  standalone: true,
  imports: [NumberStepperComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './number-stepper.section.html',
  styleUrl: './number-stepper.section.scss',
})
export class NumberStepperSection {
  protected readonly qtySm = signal(2);
  protected readonly qtyMd = signal(2);
  protected readonly qtyLg = signal(2);
  protected readonly bounded = signal(5);
  protected readonly stepped = signal(25);
}
