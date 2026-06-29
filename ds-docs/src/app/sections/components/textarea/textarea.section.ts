import { Component, ViewEncapsulation } from '@angular/core';
import { TextareaComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-textarea',
  standalone: true,
  imports: [DocsSectionComponent, TextareaComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './textarea.section.html',
  styleUrl: './textarea.section.scss',
})
export class TextareaSection {}
