import { Component, ViewEncapsulation } from '@angular/core';
import { CheckboxComponent, RadioComponent, SwitchComponent } from 'ds';
import { DocsAwaitComponent } from '../../../shared/docs-await.component';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DocsTruncationComponent, TruncationRule } from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-selection',
  standalone: true,
  imports: [CheckboxComponent, DocsAwaitComponent, DocsSectionComponent, DocsTruncationComponent, RadioComponent, SwitchComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './selection.section.html',
  styleUrl: './selection.section.scss',
})
export class SelectionSection {
  protected readonly truncationRules: TruncationRule[] = [
    { field: 'Label', behaviour: 'Single line, ellipsis. Tooltip on hover when clipped — the label IS the affordance.' },
    { field: 'Segmented option', behaviour: "Single line, no clip. If the set won't fit, switch to a Select." },
    { field: 'Slider value readout', behaviour: 'Numeric only — no clip; widen the field instead.' },
  ];
}
