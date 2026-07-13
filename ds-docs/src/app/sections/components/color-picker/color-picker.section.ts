import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ColorPickerComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-color-picker',
  standalone: true,
  imports: [ColorPickerComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './color-picker.section.html',
  styleUrls: ['../../../shared/section-demo.scss', '../../../shared/section-demo.responsive.scss'],
})
export class ColorPickerSection {
  protected readonly brand = signal('#2F54FF');
  protected readonly label = signal('#16A34A');
}
