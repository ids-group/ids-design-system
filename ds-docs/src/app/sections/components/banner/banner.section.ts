import { Component, ViewEncapsulation } from '@angular/core';
import { BannerComponent, ButtonComponent, IconComponent } from 'ds';

@Component({
  selector: 'section-components-banner',
  standalone: true,
  imports: [BannerComponent, ButtonComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './banner.section.html',
  styleUrl: './banner.section.scss',
})
export class BannerSection {}
