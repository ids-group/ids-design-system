import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { DatePickerComponent } from 'ds/date-picker';
import { FieldGroupComponent } from 'ds/field-group';
import { InputComponent } from 'ds/input';
import { SearchComponent } from 'ds/search';
import { SelectComponent } from 'ds/select';
import type { SelectOption } from 'ds/select';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-field-group',
  standalone: true,
  imports: [
    ButtonComponent,
    DatePickerComponent,
    FieldGroupComponent,
    InputComponent,
    SearchComponent,
    SelectComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './field-group.section.html',
  styleUrls: ['../../../shared/section-demo.scss'],
})
export class FieldGroupSection {
  protected readonly scopes: SelectOption[] = [
    { value: 'all', label: 'All fields' },
    { value: 'name', label: 'Name' },
    { value: 'owner', label: 'Owner' },
  ];
  protected readonly units: SelectOption[] = [
    { value: 'kg', label: 'kg' },
    { value: 'lb', label: 'lb' },
  ];

  protected readonly scope = signal('all');
  protected readonly term = signal('');
  protected readonly amount = signal('');
  protected readonly unit = signal('kg');
  protected readonly invalidTerm = signal('');
  protected readonly since = signal<Date | null>(null);
  protected readonly quickFind = signal('');
}
