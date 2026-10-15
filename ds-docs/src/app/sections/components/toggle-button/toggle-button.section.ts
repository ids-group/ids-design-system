import { Component, ViewEncapsulation } from '@angular/core';
import { ToggleButtonComponent } from 'ds/toggle-button';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-toggle-button',
  standalone: true,
  imports: [DocsSectionComponent, ToggleButtonComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './toggle-button.section.html',
  styleUrl: './toggle-button.section.scss',
})
export class ToggleButtonSection {}
