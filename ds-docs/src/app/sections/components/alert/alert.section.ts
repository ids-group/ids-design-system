import { Component, ViewEncapsulation, signal } from '@angular/core';
import { AlertComponent } from 'ds/alert';
import { ButtonComponent } from 'ds/button';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-alert',
  standalone: true,
  imports: [AlertComponent, ButtonComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './alert.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './alert.section.scss'],
})
export class AlertSection {
  protected readonly dismissed = signal(false);
}
