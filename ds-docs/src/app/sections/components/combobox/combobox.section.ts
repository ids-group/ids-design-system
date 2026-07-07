import { Component, ViewEncapsulation, signal } from '@angular/core';
import {
  ComboboxComponent,
  type ComboboxOption,
  type ComboboxOptionGroup,
} from 'ds';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

const MEMBERS: readonly ComboboxOption<string>[] = [
  { value: 'acme', label: 'Acme Holdings' },
  { value: 'festi', label: 'Festicket Ltd' },
  { value: 'livenation', label: 'Live Nation Festivals' },
  { value: 'sjm', label: 'SJM Concerts' },
];

const PRODUCTS: readonly ComboboxOption<string>[] = [
  { value: 'beer', label: 'Beer kegs' },
  { value: 'cider', label: 'Cider' },
  { value: 'spirits', label: 'Spirits' },
  { value: 'wine', label: 'Wine' },
  { value: 'mixers', label: 'Mixers' },
];

const VENUE_GROUPS: ComboboxOptionGroup<string>[] = [
  {
    label: 'Arenas',
    options: [
      { value: 'o2', label: 'The O2 Arena' },
      { value: 'utilita', label: 'Utilita Arena Birmingham' },
      { value: 'sse', label: 'OVO Hydro Glasgow' },
    ],
  },
  {
    label: 'Festivals',
    options: [
      { value: 'glastonbury', label: 'Glastonbury Festival' },
      { value: 'reading', label: 'Reading Festival' },
      { value: 'download', label: 'Download Festival' },
    ],
  },
  {
    label: 'Clubs',
    options: [
      { value: 'fabric', label: 'fabric London' },
      { value: 'egg', label: 'EGG London' },
    ],
  },
];

@Component({
  selector: 'section-components-combobox',
  standalone: true,
  imports: [ComboboxComponent, DocsTruncationComponent, DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './combobox.section.html',
  styleUrl: './combobox.section.scss',
})
export class ComboboxSection {
  protected readonly members = MEMBERS;
  protected readonly products = PRODUCTS;
  protected readonly venueGroups = VENUE_GROUPS;
  protected readonly memberValue = signal<string | null>('festi');
  protected readonly productsValue = signal<readonly string[]>([
    'beer',
    'cider',
    'spirits',
  ]);
  protected readonly venueValue = signal<string | null>(null);
  protected readonly toolbarProductsValue = signal<readonly string[]>(['beer']);
  protected readonly toolbarVenueValue = signal<string | null>(null);
  protected readonly tagOptions = signal<readonly ComboboxOption<string>[]>([
    { value: 'jazz', label: 'Jazz' },
    { value: 'rock', label: 'Rock' },
    { value: 'electronic', label: 'Electronic' },
  ]);
  protected readonly tagValue = signal<readonly string[]>([]);

  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Token chip in the input',
      behaviour:
        'Single line, ellipsis at ~16 ch. Tooltip on hover when clipped.',
    },
    {
      field: 'Option label in dropdown',
      behaviour:
        'Single line, ellipsis. Tooltip on hover always (the popover is narrow).',
    },
    {
      field: 'Secondary metadata',
      behaviour: 'Single line, ellipsis. Drop before the primary label clips.',
    },
  ];

  protected onCreateTag(label: string): void {
    const newOption: ComboboxOption<string> = {
      value: label.toLowerCase().replace(/\s+/g, '-'),
      label,
    };
    this.tagOptions.update((current) => [...current, newOption]);
    this.tagValue.update((current) => [...current, newOption.value]);
  }
}
