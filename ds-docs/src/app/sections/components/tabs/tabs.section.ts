import { Component, ViewEncapsulation } from '@angular/core';
import { TabsComponent, TabComponent, IconComponent } from 'ds';

@Component({
  selector: 'section-components-tabs',
  standalone: true,
  imports: [TabsComponent, TabComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './tabs.section.html',
  styleUrl: './tabs.section.scss',
})
export class TabsSection {}
