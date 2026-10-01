import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  ViewEncapsulation,
  inject,
  input,
  output,
} from '@angular/core';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';

/**
 * Provided by a chart that wraps `ds-chart` and draws the Unpin control for its cursor itself,
 * on its own caption line; the wrapped `ds-chart` then draws none.
 *
 * @internal
 */
export const CHART_UNPIN_DRAWN_BY_HOST = new InjectionToken<true>(
  'CHART_UNPIN_DRAWN_BY_HOST',
);

/**
 * The control that releases a held mark or category, at the top end of the chart. Every chart
 * draws this one; the chart's own stylesheet makes room for it through `chart-frame.pin-reset`.
 *
 * @internal
 */
@Component({
  selector: 'ds-chart-unpin',
  standalone: true,
  template: `
    @if (pinned()) {
      <button class="pin-reset" type="button" (click)="release.emit()">
        {{ intl().chart.unpin }}
      </button>
    }
  `,
  styleUrl: './chart-unpin.component.scss',
  host: {
    '[class.is-pinned]': 'pinned()',
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartUnpinComponent {
  readonly pinned = input.required<boolean>();

  readonly release = output();

  protected readonly intl = inject(DS_INTL);
}
