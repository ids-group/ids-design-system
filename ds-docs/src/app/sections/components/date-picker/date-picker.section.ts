import { Component, ViewEncapsulation } from '@angular/core';
import { DatePickerComponent } from 'ds';
import { DocsAwaitComponent } from '../../../shared/docs-await.component';
import { DocsTruncationComponent, TruncationRule } from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-date-picker',
  standalone: true,
  imports: [DatePickerComponent, DocsAwaitComponent, DocsTruncationComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './date-picker.section.html',
  styleUrl: './date-picker.section.scss',
})
export class DatePickerSection {
  protected readonly truncationRules: TruncationRule[] = [
    { field: 'Selected-date label', behaviour: 'Numeric date only — no clip.' },
    { field: 'Range label', behaviour: '"Start – End" format — no clip; abbreviates year if same.' },
    { field: 'Calendar day', behaviour: 'Single digit/two digits — no clip ever.' },
  ];
}
