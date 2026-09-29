import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import {
  CHART_HOVER_DELAY_MS,
  chartDwell,
  nextControlId,
} from '@ids-group-ltd/ids-design-system/components';
import {
  DS_INTL,
  resolveWithConfig,
} from '@ids-group-ltd/ids-design-system/core';
import type { ChartLegendItem } from './chart-legend.types';

/**
 * The key beside a chart, and, when `toggleable`, the control that hides a series.
 *
 * Ordinary DOM, never inside the `<svg>`: an item is a real input, so the toggle is
 * keyboard-operable and announced without a custom role.
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

  /** Offers the control. Off leaves the legend a plain key. */
  readonly toggleable = input(false, { transform: booleanAttribute });

  /** `'isolate'` shows one series and hides the rest (a radio group with an "All" option);
   *  `'toggle'` hides one and leaves the rest (checkboxes). */
  readonly mode = input<'toggle' | 'isolate'>('isolate');

  /** The item under the pointer or holding focus, which the chart dims from. A pointer names it after
   *  resting for `DS_CONFIG.chart.hoverDelayMs`; focus names it at once. */
  readonly highlighted = model<string | null>(null);

  private readonly dwell = chartDwell(
    resolveWithConfig(
      signal<number | null>(null),
      (config) => config.chart?.hoverDelayMs,
      CHART_HOVER_DELAY_MS,
    ),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.dwell.cancel());
  }

  protected onItemEnter(id: string, event: PointerEvent): void {
    this.dwell.schedule(id, () => this.highlighted.set(id), event);
  }

  protected onItemLeave(): void {
    this.dwell.cancel();
    this.highlighted.set(null);
  }

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

  /** Radio groups are scoped by name across the document; a shared name would make every legend on
   *  the page one group. */
  protected readonly groupName = nextControlId('ds-chart-legend');

  /** Which radio is on: an item's id or `'all'`, never none (an empty radio group reads as broken).
   *  A partial hidden set left over from `'toggle'` settles on `'all'`. */
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
