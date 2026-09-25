import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { DsPanelFooterTemplateDirective } from 'ds/components';
import { SelectComponent } from 'ds/select';
import type { SelectOption } from 'ds/select';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DocsNonmodalNoteComponent } from '../../../shared/docs-nonmodal-note.component';

@Component({
  selector: 'section-components-select',
  standalone: true,
  imports: [
    ButtonComponent,
    DsPanelFooterTemplateDirective,
    SelectComponent,
    DocsSectionComponent,
    DocsNonmodalNoteComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './select.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './select.section.scss'],
})
export class SelectSection {
  protected readonly country = signal('');
  protected readonly plan = signal('team');
  protected readonly resetPlan = signal('team');

  protected readonly countryOptions: SelectOption[] = [
    'Argentina',
    'Australia',
    'Austria',
    'Belgium',
    'Brazil',
    'Canada',
    'Chile',
    'Denmark',
    'Estonia',
    'Finland',
    'France',
    'Germany',
    'Greece',
    'Iceland',
    'Ireland',
    'Italy',
    'Japan',
    'Latvia',
  ].map((name) => ({ value: name.toLowerCase(), label: name }));

  protected readonly planOptions: SelectOption[] = [
    { value: 'free', label: 'Free' },
    { value: 'team', label: 'Team' },
    {
      value: 'enterprise',
      label: 'Enterprise',
      disabled: true,
      disabledReason: 'Available on an annual contract only',
    },
  ];

  protected readonly ownerOptions: SelectOption[] = [
    { label: 'Avery Brooks', value: 'brooks' },
    { label: 'Sam Carter', value: 'carter' },
    { label: 'Jamie Lin', value: 'lin' },
    { label: 'Morgan Reyes', value: 'reyes' },
  ];

  protected readonly tierOptions: SelectOption[] = [
    { label: 'Tier 1', value: 't1' },
    { label: 'Tier 2', value: 't2' },
    { label: 'Tier 3', value: 't3' },
  ];

  protected readonly productOptions: SelectOption[] = [
    { label: 'All Products', value: 'all' },
    { label: 'Hospital Indemnity', value: 'hi' },
    { label: 'Critical Illness', value: 'ci' },
    { label: 'Accident', value: 'acc' },
    { label: 'Life Insurance', value: 'life' },
  ];

  protected readonly openSpecimenOptions: SelectOption[] = [
    { label: 'All Products', value: 'all' },
    { label: 'Hospital Indemnity', value: 'hi' },
    { label: 'Critical Illness', value: 'ci' },
    { label: 'Accident', value: 'acc' },
    { label: 'Life Insurance (coming soon)', value: 'life', disabled: true },
  ];

  protected readonly iconOptions: SelectOption[] = [
    { label: 'All Products', value: 'all', icon: 'list' },
    { label: 'Hospital Indemnity', value: 'hi', icon: 'home' },
    { label: 'Critical Illness', value: 'ci', icon: 'error' },
    { label: 'Accident', value: 'acc', icon: 'truck' },
    { label: 'Life Insurance', value: 'life', icon: 'star' },
  ];

  protected readonly regionOptions: SelectOption[] = [
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

  protected readonly longLabelOptions: SelectOption[] = [
    {
      label: 'Rotterdam, Maasvlakte II deep-sea container terminal, berth 7',
      value: 'rtm',
    },
    {
      label: 'Felixstowe, Trinity terminal, overflow yard behind gate 3',
      value: 'fxt',
    },
    { label: 'Antwerp', value: 'anr' },
  ];

  protected readonly roleOptions: SelectOption[] = [
    { label: 'Viewer', value: 'viewer' },
    { label: 'Editor', value: 'editor' },
    { label: 'Admin', value: 'admin' },
  ];

  protected readonly roleIconOptions: SelectOption[] = [
    { label: 'Viewer', value: 'viewer', icon: 'eye' },
    { label: 'Editor', value: 'editor', icon: 'edit' },
    { label: 'Admin', value: 'admin', icon: 'lock' },
  ];
}
