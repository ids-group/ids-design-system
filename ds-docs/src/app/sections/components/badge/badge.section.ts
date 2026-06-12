import { Component, ViewEncapsulation } from '@angular/core';
import { BadgeComponent, IconComponent, StatusDotComponent, TagComponent } from 'ds';

@Component({
  selector: 'section-components-badge',
  standalone: true,
  imports: [BadgeComponent, IconComponent, StatusDotComponent, TagComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './badge.section.html',
  styleUrl: './badge.section.scss',
})
export class BadgeSection {}
