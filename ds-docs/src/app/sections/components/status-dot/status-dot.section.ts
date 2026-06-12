import { Component, ViewEncapsulation } from '@angular/core';
import { IconComponent, StatusDotComponent } from 'ds';

@Component({
  selector: 'section-components-status-dot',
  standalone: true,
  imports: [IconComponent, StatusDotComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './status-dot.section.html',
  styleUrl: './status-dot.section.scss',
})
export class StatusDotSection {}
