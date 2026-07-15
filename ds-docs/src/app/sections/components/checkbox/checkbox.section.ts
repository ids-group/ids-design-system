import { Component, ViewEncapsulation } from '@angular/core';
import { CheckboxComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-checkbox',
  standalone: true,
  imports: [
    CheckboxComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './checkbox.section.html',
  styleUrls: [
    '../../../shared/section-demo.scss',
    '../../../shared/section-demo.responsive.scss',
    './checkbox.section.scss',
  ],
})
export class CheckboxSection {}
