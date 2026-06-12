import { Component, ViewEncapsulation } from '@angular/core';
import { CheckboxComponent, RadioComponent, SwitchComponent } from 'ds';

@Component({
  selector: 'section-components-selection',
  standalone: true,
  imports: [CheckboxComponent, RadioComponent, SwitchComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './selection.section.html',
  styleUrl: './selection.section.scss',
})
export class SelectionSection {}
