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
  styleUrls: [
    '../../../shared/section-demo.scss',
    './description-list.section.scss',
  ],
})
export class DescriptionListSection {}
