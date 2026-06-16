import { Component, ViewEncapsulation } from '@angular/core';
import {
  DropdownComponent,
  IconComponent,
  InputComponent,
  NumberStepperComponent,
  SearchComponent,
  SpinnerComponent,
  TagComponent,
  TextareaComponent,
  type DropdownOption,
} from 'ds';
import { DocsAwaitComponent } from '../../../shared/docs-await.component';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DocsTruncationComponent, TruncationRule } from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-input',
  standalone: true,
  imports: [
    DocsAwaitComponent,
    DocsSectionComponent,
    DocsTruncationComponent,
    DropdownComponent,
    IconComponent,
    InputComponent,
    NumberStepperComponent,
    SearchComponent,
    SpinnerComponent,
    TagComponent,
    TextareaComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './input.section.html',
  styleUrl: './input.section.scss',
})
export class InputSection {
  protected readonly truncationRules: TruncationRule[] = [
    { field: 'Label', behaviour: 'Single line, no clip — labels are short by spec. Wraps if forced.' },
    { field: 'Input value', behaviour: 'No clip while focused (caret needs reach). Single-line ellipsis when blurred and overflowing; full value in title attr.' },
    { field: 'Hint', behaviour: 'Wrap to 2 lines, then ellipsis. No tooltip — hint is itself the tooltip.' },
    { field: 'Error message', behaviour: 'Wrap, no clip. Always fully visible — error must never hide.' },
  ];

  protected readonly memberOptions: DropdownOption[] = [
    { label: 'Acme Holdings', value: 'acme' },
    { label: 'Beacon Group', value: 'beacon' },
    { label: 'Catalyst Partners', value: 'catalyst' },
    { label: 'Delta Mutual', value: 'delta' },
    { label: 'Evergreen Trust', value: 'evergreen' },
  ];

  protected readonly ownerOptions: DropdownOption[] = [
    { label: 'Avery Brooks', value: 'brooks' },
    { label: 'Sam Carter', value: 'carter' },
    { label: 'Jordan Anderson', value: 'anderson' },
    { label: 'Priya Patel', value: 'patel' },
    { label: 'Maya Diaz', value: 'diaz' },
  ];
}
