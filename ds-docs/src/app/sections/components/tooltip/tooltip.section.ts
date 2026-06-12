import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonComponent, TooltipDirective, TooltipPanelComponent } from 'ds';

@Component({
  selector: 'section-components-tooltip',
  standalone: true,
  imports: [ButtonComponent, TooltipDirective, TooltipPanelComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './tooltip.section.html',
  styleUrl: './tooltip.section.scss',
})
export class TooltipSection {}
