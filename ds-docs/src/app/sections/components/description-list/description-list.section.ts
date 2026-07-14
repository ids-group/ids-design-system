import { Component, ViewEncapsulation } from '@angular/core';
import {
  BadgeComponent,
  DescriptionItemComponent,
  DescriptionListComponent,
} from 'ds';
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
  styleUrls: ['../../../shared/section-demo.scss', '../../../shared/section-demo.responsive.scss'],
})
export class DescriptionListSection {}
