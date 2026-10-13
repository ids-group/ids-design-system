import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  input,
  model,
} from '@angular/core';
import {
  chartHoverDelayMs,
  dwellHighlight,
  nextControlId,
} from '@ids-group-ltd/ids-design-system/components';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import type { ChartLegendItem } from './chart-legend.types';

/**
 * The key beside a chart, and, when `toggleable`, the control that hides a series.
 * Real inputs in ordinary DOM, never inside the `<svg>`.
 *
 * @internal
 */
@Component({
  selector: 'ds-chart-legend',
  standalone: true,
  templateUrl: './chart-legend.component.html',
  styleUrl: './chart-legend.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartLegendComponent {
  protected readonly intl = inject(DS_INTL);

  readonly items = input.required<readonly ChartLegendItem[]>();

  /** Ids of the hidden items. Two-way, so a page can drive it from a URL parameter. */
  readonly hidden = model<readonly string[]>([]);

  /** Makes each item hide its series; off leaves a plain key. */
  readonly toggleable = input(false, { transform: booleanAttribute });

  /** `'isolate'` shows one series and hides the rest (a radio group with an "All" option);
   *  `'toggle'` hides one and leaves the rest (checkboxes). */
  readonly mode = input<'toggle' | 'isolate'>('isolate');

  /** The item under the pointer or holding focus, which the chart dims from; a pointer waits
   *  `DS_CONFIG.chart.hoverDelayMs`. */
  readonly highlighted = model<string | null>(null);

  protected readonly highlight = dwellHighlight(
    this.highlighted,
    chartHoverDelayMs(),
  );

  protected isHidden(id: string): boolean {
    return this.hidden().includes(id);
  }

  protected toggle(id: string): void {
    const hidden = this.hidden();

    this.hidden.set(
      hidden.includes(id)
        ? hidden.filter((entry) => entry !== id)
        : [...hidden, id],
    );
  }

  /** Radio group name; unique per legend. */
  protected readonly groupName = nextControlId('ds-chart-legend');

  /** The radio that is on: an item id, `'all'`, or `'none'`. */
  protected readonly isolated = computed(() => {
    const items = this.items();
    const visible = items.filter((item) => !this.isHidden(item.id));
    if (visible.length === 0 && items.length > 0) {
      return 'none';
    }
    if (visible.length === 1) {
      return visible[0].id;
    }

    return 'all';
  });

  protected isolate(id: string): void {
    this.hidden.set(
      this.items()
        .filter((item) => item.id !== id)
        .map((item) => item.id),
    );
  }

  protected showAll(): void {
    this.hidden.set([]);
  }

  protected hideAll(): void {
    this.hidden.set(this.items().map((item) => item.id));
  }
}
