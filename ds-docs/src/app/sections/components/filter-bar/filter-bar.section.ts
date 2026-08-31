import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import {
  ButtonComponent,
  DatePickerComponent,
  FilterBarComponent,
  FilterItemDirective,
  SearchComponent,
  SelectComponent,
  type SelectOption,
} from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-filter-bar',
  standalone: true,
  imports: [
    ButtonComponent,
    DatePickerComponent,
    FilterBarComponent,
    FilterItemDirective,
    SearchComponent,
    SelectComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-bar.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './filter-bar.section.scss'],
})
export class FilterBarSection {
  /** In the TS because a template cannot hold a bare `{` — Angular reads it as the
   *  start of an ICU block. Same shape as the theming page's snippets. */
  protected readonly trailingWrapperSnippet = `:host {
  display: flex;
  align-items: flex-end;
  gap: var(--ds-filter-bar-gap, var(--space-3));
}`;

  /** Drives the resizable demo frame, so the collapse can be watched without
   *  resizing the browser. */
  protected readonly frameWidth = signal(920);

  protected readonly status = signal('');
  protected readonly owner = signal('');
  protected readonly region = signal('');
  protected readonly opened = signal<Date | null>(null);
  protected readonly term = signal('');

  protected readonly statuses: SelectOption[] = [
    { value: 'open', label: 'Open' },
    { value: 'pending', label: 'Pending' },
    { value: 'closed', label: 'Closed' },
  ];

  protected readonly owners: SelectOption[] = [
    { value: 'ann', label: 'Ann Fletcher' },
    { value: 'raj', label: 'Raj Patel' },
  ];

  protected readonly regions: SelectOption[] = [
    { value: 'north', label: 'North' },
    { value: 'south', label: 'South' },
  ];

  protected clear(): void {
    this.status.set('');
    this.owner.set('');
    this.region.set('');
    this.opened.set(null);
    this.term.set('');
  }
}
