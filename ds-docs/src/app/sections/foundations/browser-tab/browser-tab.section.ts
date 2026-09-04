import { Component, ViewEncapsulation } from '@angular/core';
import { IconComponent } from 'ds/icons';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-foundations-browser-tab',
  standalone: true,
  imports: [IconComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './browser-tab.section.html',
  styleUrl: './browser-tab.section.scss',
})
export class BrowserTabSection {}
