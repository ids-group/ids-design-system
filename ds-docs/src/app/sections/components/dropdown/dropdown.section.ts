import { Component, ViewEncapsulation } from '@angular/core';
import {
  DropdownComponent,
  type DropdownOption,
  type DropdownOptionGroup,
} from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-dropdown',
  standalone: true,
  imports: [DocsSectionComponent, DropdownComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './dropdown.section.html',
  styleUrl: './dropdown.section.scss',
})
export class DropdownSection {
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

  protected readonly regionGroups: DropdownOptionGroup[] = [
    {
      label: 'Americas',
      options: [
        { label: 'North America — East', value: 'na-e' },
        { label: 'North America — West', value: 'na-w' },
        { label: 'South America', value: 'sa' },
      ],
    },
    {
      label: 'Europe',
      options: [
        { label: 'Europe — Northern', value: 'eu-n' },
        { label: 'Europe — Western', value: 'eu-w' },
        { label: 'Europe — Southern', value: 'eu-s' },
      ],
    },
    {
      label: 'Asia Pacific',
      options: [
        { label: 'Asia — South', value: 'as-s' },
        { label: 'Asia — East', value: 'as-e' },
        { label: 'Oceania', value: 'oc' },
      ],
    },
  ];
}
