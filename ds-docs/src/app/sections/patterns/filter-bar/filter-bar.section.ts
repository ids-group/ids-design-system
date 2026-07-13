import { Component, ViewEncapsulation } from '@angular/core';
import {
  SearchComponent,
  ButtonComponent,
  IconComponent,
  SelectComponent,
  TagComponent,
  type SelectOption,
} from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'pattern-filter-bar',
  standalone: true,
  imports: [
    DocsSectionComponent,
    SearchComponent,
    ButtonComponent,
    IconComponent,
    SelectComponent,
    TagComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './filter-bar.section.html',
  styleUrls: ['./filter-bar.section.scss', './filter-bar.section.responsive.scss'],
})
export class FilterBarSection {
  protected readonly lede =
    'Search, dropdown facets, applied-filter tags and a clear-all escape hatch — composed above any list view. Reflows to a stacked variant on narrow viewports.';

  protected readonly statusOptions: SelectOption[] = [
    { label: 'All statuses', value: '' },
    { label: 'Planning', value: 'planning' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  protected readonly memberOptions: SelectOption[] = [
    { label: 'All members', value: '' },
    { label: 'Acme Holdings', value: 'acme' },
    { label: 'North Site Co.', value: 'north' },
    { label: 'Delta Partners', value: 'delta' },
  ];
}
