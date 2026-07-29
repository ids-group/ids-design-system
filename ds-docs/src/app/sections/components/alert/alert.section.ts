import { Component, ViewEncapsulation } from '@angular/core';
import { AlertComponent, ButtonComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-alert',
  standalone: true,
  imports: [AlertComponent, ButtonComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './alert.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './alert.section.scss'],
})
export class AlertSection {}
