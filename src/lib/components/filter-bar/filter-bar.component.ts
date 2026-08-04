import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  contentChildren,
  effect,
  input,
  isDevMode,
  signal,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { PopoverComponent } from '../popover/popover.component';
import { ProjectionDroppedDirective } from '../projection-dropped.directive';
import { FilterItemDirective } from './filter-item.directive';

// Room kept for the "+N more" trigger, which only exists once something has
// already collapsed. Measuring the real button would need it rendered first, and
// its width then feeds back into the count that decides whether it renders at
// all — a loop. A constant costs nothing: inline slots may shrink, so a longer
// translation of the label takes space from them instead of breaking the row.
const MORE_TRIGGER_WIDTH = 132;

/**
 * Priority+ filter row: renders as many filters as fit and collapses the rest
 * into a "+N more" panel. Every admin list past three filters hits the same wall
 * — the row wraps to a second line on a laptop, or the consumer hand-rolls this.
 *
 * The split is decided from each item's declared width plus one `ResizeObserver`
 * on the row, never by measuring the filters themselves: they would have to be in
 * the DOM to be measured, so anything that did not fit would flash before being
 * taken away. `[dsFilterItem]` carries the width.
 *
 * Anything marked `dsFilterBarTrailing` — search, a Clear button — sits at the
 * trailing edge and never collapses. Mark each control rather than wrapping them:
 * the bar owns that row's gap and alignment, and a projected wrapper would be a
 * plain block whose children stack. The trailing group is outside the measured
 * row, so flexbox subtracts its width before the row is measured and the
 * arithmetic needs no allowance for it.
 *
 * ```html
 * <ds-filter-bar>
 *   <ng-template [dsFilterItem]="180">
 *     <ds-select label="Status" … />
 *   </ng-template>
 *   <ng-template [dsFilterItem]="220">
 *     <ds-date-picker label="Opened" … />
 *   </ng-template>
 *
 *   <ds-search dsFilterBarTrailing … />
 *   <ds-button dsFilterBarTrailing variant="text">Clear</ds-button>
 * </ds-filter-bar>
 * ```
 */
@Component({
  selector: 'ds-filter-bar',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    ButtonComponent,
    PopoverComponent,
    ProjectionDroppedDirective,
  ],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBarComponent {
  /** Trailing word of the trigger, after the count: "+2 filters". */
  readonly moreLabel = input<string>('more');
  /** Accessible name of the overflow panel. */
  readonly panelLabel = input<string>('More filters');

  protected readonly devMode = isDevMode();

  // descendants: true so a filter wrapped in @if or @for is still found — those
  // put it in an embedded view, which a direct-children query does not reach.
  protected readonly items = contentChildren(FilterItemDirective, {
    descendants: true,
  });

  private readonly row = viewChild<ElementRef<HTMLElement>>('row');
  private readonly rowWidth = signal(0);
  // Read off the row rather than hard-coded, so retuning --ds-filter-bar-gap
  // cannot silently desynchronise the arithmetic from what is rendered.
  private readonly gap = signal(0);

  protected readonly inlineCount = computed<number>(() => {
    const items = this.items();
    const available = this.rowWidth();
    if (!available) {
      return items.length;
    }

    const gap = this.gap();
    const total = items.reduce(
      (sum, item, index) => sum + (index > 0 ? gap : 0) + item.width(),
      0,
    );
    if (total <= available) {
      return items.length;
    }

    // Only now is the trigger certain to render, so only now does it cost room.
    const budget = available - MORE_TRIGGER_WIDTH - gap;
    let used = 0;
    let count = 0;
    for (const item of items) {
      used += (count > 0 ? gap : 0) + item.width();
      if (used > budget) {
        break;
      }
      count++;
    }

    return count;
  });

  protected readonly inline = computed(() =>
    this.items().slice(0, this.inlineCount()),
  );

  /** The filters currently in the overflow panel. */
  readonly collapsed = computed(() => this.items().slice(this.inlineCount()));

  constructor() {
    effect((onCleanup) => {
      const row = this.row()?.nativeElement;
      if (!row) {
        return;
      }

      const measure = (): void => {
        this.rowWidth.set(row.clientWidth);
        this.gap.set(parseFloat(getComputedStyle(row).columnGap) || 0);
      };

      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(row);
      onCleanup(() => observer.disconnect());
    });
  }
}
