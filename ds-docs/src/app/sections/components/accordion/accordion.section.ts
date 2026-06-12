import { Component, ViewEncapsulation } from '@angular/core';
import { AccordionComponent, AccordionItemComponent } from 'ds';

@Component({
  selector: 'section-components-accordion',
  standalone: true,
  imports: [AccordionComponent, AccordionItemComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './accordion.section.html',
  styleUrl: './accordion.section.scss',
})
export class AccordionSection {}
