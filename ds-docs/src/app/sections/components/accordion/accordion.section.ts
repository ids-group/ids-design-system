import { Component, ViewEncapsulation } from '@angular/core';
import { AccordionComponent, AccordionItemComponent } from 'ds';
import { DocsTruncationComponent, TruncationRule } from '../../../shared/docs-truncation.component';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-accordion',
  standalone: true,
  imports: [AccordionComponent, AccordionItemComponent, DocsTruncationComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './accordion.section.html',
  styleUrl: './accordion.section.scss',
})
export class AccordionSection {
  protected readonly truncationRules: TruncationRule[] = [
    { field: 'Head label', behaviour: 'Single line, ellipsis. Tooltip on hover when clipped.' },
    { field: 'Body', behaviour: 'Wraps, no clip — the panel exists to give body text room.' },
  ];
}
