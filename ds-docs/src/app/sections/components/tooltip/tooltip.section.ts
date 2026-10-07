import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { TabComponent, TabsComponent } from 'ds/tabs';
import { InfoHintComponent } from 'ds/info-hint';
import { DefinitionTermComponent } from 'ds/definition-term';
import { TooltipDirective, TooltipPanelComponent } from 'ds/tooltip';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-tooltip',
  standalone: true,
  imports: [
    ButtonComponent,
    DefinitionTermComponent,
    DocsSectionComponent,
    InfoHintComponent,
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
