import { Component, ViewEncapsulation, signal } from '@angular/core';
import { SliderComponent } from 'ds/slider';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-slider',
  standalone: true,
  imports: [DocsSectionComponent, SliderComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './slider.section.html',
  styleUrl: '../../../shared/section-demo.scss',
})
export class SliderSection {
  protected readonly brightness = signal(62);
  protected readonly price = signal<[number, number]>([20, 80]);
}
