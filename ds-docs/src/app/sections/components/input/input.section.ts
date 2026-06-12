import { Component, ViewEncapsulation } from '@angular/core';
import {
  DropdownComponent,
  IconComponent,
  InputComponent,
  NumberStepperComponent,
  SearchComponent,
  TagComponent,
  TextareaComponent,
  type DropdownOption,
} from 'ds';

@Component({
  selector: 'section-components-input',
  standalone: true,
  imports: [
    DropdownComponent,
    IconComponent,
    InputComponent,
    NumberStepperComponent,
    SearchComponent,
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
