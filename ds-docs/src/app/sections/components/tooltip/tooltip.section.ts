import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { TabComponent, TabsComponent } from 'ds/tabs';
import { TooltipDirective, TooltipPanelComponent } from 'ds/tooltip';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-tooltip',
  standalone: true,
  imports: [
    ButtonComponent,
    DocsSectionComponent,
    TabComponent,
    TabsComponent,
    TooltipDirective,
    TooltipPanelComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './tooltip.section.html',
  styleUrl: './tooltip.section.scss',
})
export class TooltipSection {}
