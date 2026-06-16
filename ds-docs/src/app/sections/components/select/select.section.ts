import { Component, ViewEncapsulation } from '@angular/core';
import { DropdownComponent, type DropdownOption } from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DocsTruncationComponent, TruncationRule } from '../../../shared/docs-truncation.component';

@Component({
  selector: 'section-components-select',
  standalone: true,
  imports: [DropdownComponent, DocsSectionComponent, DocsTruncationComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './select.section.html',
  styleUrl: './select.section.scss',
})
export class SelectSection {
  protected readonly ownerOptions: DropdownOption[] = [
    { label: 'Avery Brooks', value: 'brooks' },
    { label: 'Sam Carter', value: 'carter' },
    { label: 'Jamie Lin', value: 'lin' },
    { label: 'Morgan Reyes', value: 'reyes' },
  ];

  protected readonly tierOptions: DropdownOption[] = [
    { label: 'Tier 1', value: 't1' },
    { label: 'Tier 2', value: 't2' },
    { label: 'Tier 3', value: 't3' },
  ];

  protected readonly productOptions: DropdownOption[] = [
    { label: 'All Products', value: 'all' },
    { label: 'Hospital Indemnity', value: 'hi' },
    { label: 'Critical Illness', value: 'ci' },
    { label: 'Accident', value: 'acc' },
    { label: 'Life Insurance', value: 'life' },
  ];

  protected readonly openSpecimenOptions: DropdownOption[] = [
    { label: 'All Products', value: 'all' },
    { label: 'Hospital Indemnity', value: 'hi' },
    { label: 'Critical Illness', value: 'ci' },
    { label: 'Accident', value: 'acc' },
    { label: 'Life Insurance (coming soon)', value: 'life', disabled: true },
  ];

  protected readonly iconOptions: DropdownOption[] = [
    { label: 'All Products', value: 'all', icon: 'list' },
    { label: 'Hospital Indemnity', value: 'hi', icon: 'home' },
    { label: 'Critical Illness', value: 'ci', icon: 'error' },
    { label: 'Accident', value: 'acc', icon: 'truck' },
    { label: 'Life Insurance', value: 'life', icon: 'star' },
  ];

  protected readonly regionOptions: DropdownOption[] = [
    { label: 'North America — East', value: 'na-e' },
    { label: 'North America — West', value: 'na-w' },
    { label: 'South America — Andean', value: 'sa-a' },
    { label: 'South America — Southern Cone', value: 'sa-s' },
    { label: 'Europe — Northern', value: 'eu-n' },
    { label: 'Europe — Western', value: 'eu-w' },
    { label: 'Europe — Central', value: 'eu-c' },
    { label: 'Europe — Southern', value: 'eu-s' },
    { label: 'Middle East & North Africa', value: 'mena' },
    { label: 'Sub-Saharan Africa', value: 'ssa' },
    { label: 'Asia — South', value: 'as-s' },
    { label: 'Asia — Southeast', value: 'as-se' },
    { label: 'Asia — East', value: 'as-e' },
    { label: 'Oceania', value: 'oc' },
    { label: 'Antarctica (research only)', value: 'ant' },
  ];

  protected readonly truncationRules: TruncationRule[] = [
    { field: 'Option label', behaviour: 'Single line, ellipsis at control width. Panel scrolls internally past its 320px max-height.' },
    { field: 'Selected value', behaviour: 'Single line, ellipsis when overflowing the control.' },
  ];
}
