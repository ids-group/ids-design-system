import { Component, ViewEncapsulation } from '@angular/core';
import { BannerComponent } from 'ds/banner';
import { ButtonComponent } from 'ds/button';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-banner',
  standalone: true,
  imports: [BannerComponent, ButtonComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './banner.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './banner.section.scss'],
})
export class BannerSection {}
