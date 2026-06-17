import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ComboboxComponent, type ComboboxOption } from 'ds';
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
  protected readonly memberValue = signal<string | null>('festi');
  protected readonly productsValue = signal<readonly string[]>([
    'beer',
    'cider',
    'spirits',
  ]);
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
}
