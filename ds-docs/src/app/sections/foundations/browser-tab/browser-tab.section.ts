import { Component, ViewEncapsulation } from '@angular/core';
import { IconComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-foundations-browser-tab',
  standalone: true,
  imports: [IconComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './browser-tab.section.html',
  styleUrls: [
    './browser-tab.section.scss',
    './browser-tab.section.responsive.scss',
  ],
})
export class BrowserTabSection {}
