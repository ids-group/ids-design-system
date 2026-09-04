import { Component, ViewEncapsulation } from '@angular/core';
import { SwitchComponent } from 'ds/switch';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-switch',
  standalone: true,
  imports: [DocsSectionComponent, SwitchComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './switch.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './switch.section.scss'],
})
export class SwitchSection {}
