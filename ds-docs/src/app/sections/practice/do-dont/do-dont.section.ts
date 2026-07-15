import { Component, ViewEncapsulation } from '@angular/core';
import { BadgeComponent, ButtonComponent, IconComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'practice-do-dont',
  standalone: true,
  imports: [
    BadgeComponent,
    ButtonComponent,
    DocsSectionComponent,
    IconComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './do-dont.section.html',
  styleUrl: './do-dont.section.scss',
})
export class DoDontSection {
  protected readonly lede =
    'Seven recurring decisions where the design system has a strong opinion. Each pair shows the discipline next to the failure mode.';
}
