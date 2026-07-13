import { Component, ViewEncapsulation } from '@angular/core';
import { IconComponent, InputComponent } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-input',
  standalone: true,
  imports: [
    DocsSectionComponent,
    DocsTruncationComponent,
    IconComponent,
    InputComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './input.section.html',
  styleUrls: ['./input.section.scss', './input.section.responsive.scss'],
})
export class InputSection {
  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Label',
      behaviour:
        'Single line, no clip — labels are short by spec. Wraps if forced.',
    },
    {
      field: 'Input value',
      behaviour:
        'No clip while focused (caret needs reach). Single-line ellipsis when blurred and overflowing; full value in title attr.',
    },
    {
      field: 'Hint',
      behaviour:
        'Wrap to 2 lines, then ellipsis. No tooltip — hint is itself the tooltip.',
    },
    {
      field: 'Error message',
      behaviour: 'Wrap, no clip. Always fully visible — error must never hide.',
    },
  ];
}
