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

@Component({
  selector: 'section-components-input',
  standalone: true,
  imports: [
    DocsAwaitComponent,
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
