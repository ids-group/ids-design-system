import { Component, ViewEncapsulation } from '@angular/core';
import { StepperComponent } from 'ds';

@Component({
  selector: 'section-components-stepper',
  standalone: true,
  imports: [StepperComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './stepper.section.html',
  styleUrl: './stepper.section.scss',
})
export class StepperSection {
  protected readonly brief = ['Brief', 'Plan', 'Build', 'Review', 'Ship'];
}
