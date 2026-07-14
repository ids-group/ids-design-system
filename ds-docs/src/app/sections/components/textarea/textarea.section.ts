import { Component, ViewEncapsulation } from '@angular/core';
import { TextareaComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-textarea',
  standalone: true,
  imports: [DocsSectionComponent, TextareaComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './textarea.section.html',
  styleUrls: [
    '../../../shared/section-demo.scss',
    '../../../shared/section-demo.responsive.scss',
    './textarea.section.scss',
    './textarea.responsive.scss',
  ],
})
export class TextareaSection {}
