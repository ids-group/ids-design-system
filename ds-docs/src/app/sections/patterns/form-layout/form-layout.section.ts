import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { InputComponent } from 'ds/input';
import { StackComponent } from 'ds/layout';
import { SelectComponent } from 'ds/select';
import type { SelectOption } from 'ds/select';
import { SwitchComponent } from 'ds/switch';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'pattern-form-layout',
  standalone: true,
  imports: [
    DocsSectionComponent,
    InputComponent,
    SelectComponent,
    ButtonComponent,
    StackComponent,
    SwitchComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './form-layout.section.html',
  styleUrl: './form-layout.section.scss',
})
export class FormLayoutSection {
  protected readonly showError = signal(false);
  protected readonly lede =
    'Two-column sections, date pairs, a city / country split and an inline-edit row; a Discard / Save footer anchors every full form.';

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
