import { Component, ViewEncapsulation } from '@angular/core';
import { CheckboxComponent, SwitchComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-checkbox',
  standalone: true,
  imports: [CheckboxComponent, SwitchComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './checkbox.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './checkbox.section.scss'],
})
export class CheckboxSection {}
