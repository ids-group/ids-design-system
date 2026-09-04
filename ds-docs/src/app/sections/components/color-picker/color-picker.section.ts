import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ColorPickerComponent } from 'ds/color-picker';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DocsNonmodalNoteComponent } from '../../../shared/docs-nonmodal-note.component';

@Component({
  selector: 'section-components-color-picker',
  standalone: true,
  imports: [
    ColorPickerComponent,
    DocsSectionComponent,
    DocsNonmodalNoteComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './color-picker.section.html',
  styleUrl: '../../../shared/section-demo.scss',
})
export class ColorPickerSection {
  protected readonly brand = signal('#2F54FF');
  protected readonly label = signal('#16A34A');
}
