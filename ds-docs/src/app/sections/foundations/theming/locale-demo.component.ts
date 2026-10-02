import { Component, ViewEncapsulation, signal } from '@angular/core';
import { BarChartComponent, type BarChartRow } from 'ds/bar-chart';
import { provideDsConfig, provideDsIntl } from 'ds/core';
import { DatePickerComponent, type DateRangeValue } from 'ds/date-picker';
import { MultiSelectComponent, type MultiSelectItem } from 'ds/multi-select';
import { PaginationComponent } from 'ds/pagination';

@Component({
  selector: 'docs-locale-demo',
  standalone: true,
  imports: [
    BarChartComponent,
    DatePickerComponent,
    MultiSelectComponent,
    PaginationComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    provideDsConfig({ locale: 'de-DE' }),
    provideDsIntl({
      picker: {
        selectAll: 'Alle auswählen',
        clearSelection: 'Auswahl löschen',
        moreChips: (count) => `+${count} weitere`,
        removeChip: (label) => `${label} entfernen`,
      },
      pagination: {
        range: (first, last, total) =>
          total === 0 ? '0 von 0' : `${first}-${last} von ${total}`,
        rowsPerPage: 'Zeilen pro Seite',
      },
      chart: { empty: 'Keine Daten' },
      datePicker: {
        previousMonth: 'Vorheriger Monat',
        nextMonth: 'Nächster Monat',
      },
    }),
  ],
  template: `
    <div class="locale-demo">
      <ds-multi-select
        label="Region"
        [options]="regions"
        [selectAll]="true"
        [(value)]="selectedRegions" />

      <ds-date-picker label="Datum" [(value)]="date" />

      <ds-bar-chart
        caption="Anteil"
        [data]="shares"
        [max]="10000"
        [showPercent]="true" />

      <ds-pagination [total]="1200" />
    </div>
  `,
  styles: `
    .locale-demo {
      display: grid;
      gap: var(--space-4);
      max-width: 32rem;
      margin: var(--space-3) 0;
    }
  `,
})
export class DocsLocaleDemo {
  protected readonly regions: MultiSelectItem[] = [
    { value: 'nord', label: 'Nord' },
    { value: 'sued', label: 'Süd' },
    { value: 'ost', label: 'Ost' },
    { value: 'west', label: 'West' },
    { value: 'mitte', label: 'Mitte' },
    { value: 'kueste', label: 'Küste' },
  ];
  protected readonly selectedRegions = signal(['nord', 'sued', 'ost']);
  protected readonly date = signal<Date | DateRangeValue | null>(
    new Date(2026, 8, 24),
  );
  protected readonly shares: BarChartRow[] = [
    { label: 'Nord', value: 1350 },
    { label: 'Süd', value: 8650 },
  ];
}
