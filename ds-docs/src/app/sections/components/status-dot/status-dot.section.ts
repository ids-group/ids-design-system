import { Component, ViewEncapsulation } from '@angular/core';
import { StatusDotComponent } from 'ds/status-dot';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-status-dot',
  standalone: true,
  imports: [StatusDotComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './status-dot.section.html',
  styleUrl: './status-dot.section.scss',
})
export class StatusDotSection {}
