import { Component, ViewEncapsulation } from '@angular/core';
import { SwitchComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-switch',
  standalone: true,
  imports: [DocsSectionComponent, SwitchComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './switch.section.html',
  styleUrls: ['./switch.section.scss', './switch.responsive.scss'],
})
export class SwitchSection {}
