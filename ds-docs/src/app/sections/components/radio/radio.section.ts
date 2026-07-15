import { Component, ViewEncapsulation, signal } from '@angular/core';
import { RadioComponent, RadioGroupComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-radio',
  standalone: true,
  imports: [DocsSectionComponent, RadioComponent, RadioGroupComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './radio.section.html',
  styleUrls: [
    '../../../shared/section-demo.scss',
    './radio.section.scss',
  ],
})
export class RadioSection {
  protected readonly scheduleValue = signal<string | null>('single');
  protected readonly invalidGroupValue = signal<string | null>(null);
}
