import { Component, ViewEncapsulation } from '@angular/core';
import { IconComponent } from 'ds';

@Component({
  selector: 'section-foundations-browser-tab',
  standalone: true,
  imports: [IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './browser-tab.section.html',
  styleUrl: './browser-tab.section.scss',
})
export class BrowserTabSection {}
