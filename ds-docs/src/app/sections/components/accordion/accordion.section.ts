import { Component, ViewEncapsulation } from '@angular/core';
import { AccordionComponent, AccordionItemComponent } from 'ds/accordion';
import { BadgeComponent } from 'ds/badge';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-accordion',
  standalone: true,
  imports: [AccordionComponent, AccordionItemComponent, BadgeComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './accordion.section.html',
  styleUrl: './accordion.section.scss',
})
export class AccordionSection {}
