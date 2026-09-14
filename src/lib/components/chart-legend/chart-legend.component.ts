import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  model,
} from '@angular/core';
import type { ChartLegendItem } from './chart-legend.types';

/**
 * The key beside a chart, and — when `toggleable` — the control that hides a series.
 *
 * Ordinary DOM, never inside the `<svg>`: an item is a real `<input type="checkbox">`, which is
 * what makes the toggle keyboard-operable and correctly announced without inventing a role.
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
  readonly items = input.required<readonly ChartLegendItem[]>();

  /** Ids of the hidden items. Two-way, so a page can drive it from a URL parameter and so
   *  cross-chart filtering later is this same mechanism. */
  readonly hidden = model<readonly string[]>([]);

  /** Offers the toggle. Off leaves the legend a plain key. */
  readonly toggleable = input(false, { transform: booleanAttribute });

  /** The item under the pointer or holding focus, which is what the chart dims from. */
  readonly highlighted = model<string | null>(null);

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
}
