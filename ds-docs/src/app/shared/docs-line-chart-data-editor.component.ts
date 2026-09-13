import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  model,
  signal,
} from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { IconButtonComponent } from 'ds/icon-button';
import { InputComponent } from 'ds/input';
import type { LineChartSeries } from 'ds/line-chart';

let nextSeriesId = 0;

@Component({
  selector: 'docs-line-chart-data-editor',
  standalone: true,
  imports: [ButtonComponent, IconButtonComponent, InputComponent],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'chart-data-editor' },
  templateUrl: './docs-line-chart-data-editor.component.html',
  styleUrl: './docs-line-chart-data-editor.component.scss',
})
export class DocsLineChartDataEditorComponent {
  readonly categories = model.required<readonly string[]>();
  readonly series = model.required<readonly LineChartSeries[]>();

  protected readonly open = signal(false);

  protected readonly gridColumns = computed(
    () =>
      `minmax(120px, 1fr) repeat(${this.categories().length}, minmax(132px, 1fr)) auto`,
  );

  protected readingText(series: LineChartSeries, index: number): string {
    const reading = series.data[index];

    return reading == null ? '' : String(reading);
  }

  protected setCategory(index: number, name: string): void {
    this.categories.update((categories) =>
      categories.map((category, position) =>
        position === index ? name : category,
      ),
    );
  }

  protected addCategory(): void {
    const name = `Category ${this.categories().length + 1}`;
    this.series.update((series) =>
      series.map((entry) => ({ ...entry, data: [...entry.data, 0] })),
    );
    this.categories.update((categories) => [...categories, name]);
  }

  protected removeCategory(index: number): void {
    this.series.update((series) =>
      series.map((entry) => ({
        ...entry,
        data: entry.data.filter(
          (unusedReading, position) => position !== index,
        ),
      })),
    );
    this.categories.update((categories) =>
      categories.filter((unusedCategory, position) => position !== index),
    );
  }

  protected setSeriesLabel(index: number, label: string): void {
    this.patchSeries(index, (entry) => ({ ...entry, label }));
  }

  // An unparseable or blank reading becomes `null` rather than being refused: that is
  // the only way a reader can produce the hole the `gaps` input exists to draw.
  protected setReading(
    seriesIndex: number,
    categoryIndex: number,
    text: string,
  ): void {
    const parsed = Number(text.trim());
    const reading =
      text.trim() === '' || !Number.isFinite(parsed) ? null : parsed;

    this.patchSeries(seriesIndex, (entry) => ({
      ...entry,
      data: this.categories().map((unusedCategory, position) =>
        position === categoryIndex ? reading : (entry.data[position] ?? null),
      ),
    }));
  }

  protected addSeries(): void {
    nextSeriesId += 1;
    const added: LineChartSeries = {
      id: `docs-editor-series-${nextSeriesId}`,
      label: `Series ${nextSeriesId}`,
      data: this.categories().map(() => 0),
    };

    this.series.update((series) => [...series, added]);
  }

  protected removeSeries(index: number): void {
    this.series.update((series) =>
      series.filter((unusedSeries, position) => position !== index),
    );
  }

  private patchSeries(
    index: number,
    patch: (entry: LineChartSeries) => LineChartSeries,
  ): void {
    this.series.update((series) =>
      series.map((entry, position) =>
        position === index ? patch(entry) : entry,
      ),
    );
  }
}
