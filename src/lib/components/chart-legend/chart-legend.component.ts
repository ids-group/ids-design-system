import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ViewEncapsulation,
  booleanAttribute,
  input,
  model,
} from '@angular/core';
import { nextControlId } from '@ids-group-ltd/ids-design-system/components';
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

  /** Offers the control. Off leaves the legend a plain key. */
  readonly toggleable = input(false, { transform: booleanAttribute });

  /** What a control does. `'isolate'` shows one series and hides the rest, which is the question a
   *  reader of a crowded chart actually asks — "show me only this" takes one action instead of one
   *  per series. `'toggle'` hides one and leaves the rest, for taking a dominant series out so the
   *  others can be read at a usable scale.
   *
   *  The two are different controls, not two styles of one: isolate is a single choice among many,
   *  so it renders as a radio group with an "All" option, and toggle renders as checkboxes. That is
   *  what gives each the keyboard and screen-reader behaviour it should have. */
  readonly mode = input<'toggle' | 'isolate'>('isolate');

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

  /** Radio groups are scoped by NAME across the whole document, so a shared name would make every
   *  legend on a page one group: choosing a series in one chart would clear the choice in all the
   *  others, and only the last one rendered would show a selection at all. */
  protected readonly groupName = nextControlId('ds-chart-legend');

  /** Which radio is on: an item's id, or the two ends of the range. Always one of them, so the
   *  group is never a set of empty circles with nothing chosen — a radio group with no selection
   *  reads as broken, and the reader cannot tell "everything" from "not decided yet".
   *
   *  A partial set left over from `'toggle'` — some hidden, more than one visible — is not a state
   *  isolate can express, so it settles on `'all'` and the next choice makes it true. */
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
