import { Component, ViewEncapsulation } from '@angular/core';
import {
  InputComponent,
  SelectComponent,
  ButtonComponent,
  IconComponent,
  type SelectOption,
} from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'pattern-form-layout',
  standalone: true,
  imports: [
    DocsSectionComponent,
    InputComponent,
    SelectComponent,
    ButtonComponent,
    IconComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './form-layout.section.html',
  styleUrls: [
    './form-layout.section.scss',
    './form-layout.section.responsive.scss',
  ],
})
export class FormLayoutSection {
  protected readonly lede =
    'Two-column form section, side-by-side date pairs, a 6/12 city/country split, and an inline-edit row for one-field changes. Footer with Discard and Save anchors every full form.';

  protected readonly name = 'Project Alpha';
  protected readonly recordId = 'EVT-2026-0142';
  protected readonly buildStart = '27 Jul 2026 06:00';
  protected readonly buildEnd = '30 Jul 2026 12:00';
  protected readonly liveOpen = '30 Jul 2026 14:00';
  protected readonly liveClose = '3 Aug 2026 23:00';
  protected readonly city = 'Suffolk';
  protected readonly country = 'United Kingdom';
  protected readonly member = 'acme';
  protected readonly members: SelectOption[] = [
    { label: 'Acme Holdings', value: 'acme' },
    { label: 'North Site Co.', value: 'north' },
    { label: 'Delta Partners', value: 'delta' },
  ];
}
