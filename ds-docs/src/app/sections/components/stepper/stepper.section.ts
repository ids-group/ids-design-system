import { Component, ViewEncapsulation, signal } from '@angular/core';
import { StepperComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-stepper',
  standalone: true,
  imports: [DocsSectionComponent, StepperComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './stepper.section.html',
  styleUrl: './stepper.section.scss',
})
export class StepperSection {
  protected readonly brief = ['Brief', 'Plan', 'Build', 'Review', 'Ship'];
  protected readonly clickableCurrent = signal(2);
}
