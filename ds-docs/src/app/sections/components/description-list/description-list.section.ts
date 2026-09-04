import { Component, ViewEncapsulation } from '@angular/core';
import { BadgeComponent } from 'ds/badge';
import {
  DescriptionItemComponent,
  DescriptionListComponent,
} from 'ds/description-list';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-description-list',
  standalone: true,
  imports: [
    BadgeComponent,
    DescriptionItemComponent,
    DescriptionListComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './description-list.section.html',
  styleUrl: '../../../shared/section-demo.scss',
})
export class DescriptionListSection {}
