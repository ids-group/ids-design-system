import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import {
  skeletonColumnHeights,
  skeletonLineClip,
  skeletonWaterfallSteps,
} from '@ids-group-ltd/ids-design-system/components';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';

/** What the skeleton draws inside the axes. @internal */
export type ChartSkeletonMarks = 'columns' | 'line' | 'steps';

const TICK_POSITIONS = [0, 25, 50, 75, 100];

/** Height of the category label band under the plot, as the drawn chart budgets it. @internal */
export const CHART_SKELETON_CATEGORY_BAND = 30;

/**
 * The loading silhouette of a chart on a category axis: tick pills, the axis L, marks and category
 * pills, laid out on the same value space, plot height and gutter as the drawn chart so the card
 * keeps its height when the data lands.
 *
 * @internal
 */
@Component({
  selector: 'ds-chart-skeleton',
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    <div class="ticks">
      @for (tick of ticks; track tick) {
        <ds-skeleton
          class="pill"
          height="var(--space-2)"
          width="var(--space-6)"
          [style.top.%]="tick"
          [shimmer]="shimmer()" />
      }
    </div>

    <div class="plot">
      @if (marks() === 'line') {
        <ds-skeleton
          class="line"
          [style.clip-path]="lineClip()"
          [shimmer]="shimmer()" />
      } @else {
        @for (bar of bars(); track $index) {
          <span class="band">
            <ds-skeleton
              class="bar"
              width="50%"
              [height]="bar.height"
              [style.inset-block-end]="bar.bottom"
              [shimmer]="shimmer()" />
          </span>
        }
      }
    </div>

    <div class="categories">
      @for (bar of bars(); track $index) {
        <span class="band">
          <ds-skeleton
            class="pill"
            height="var(--space-2)"
            width="var(--space-8)"
            [shimmer]="shimmer()" />
        </span>
      }
    </div>
  `,
  styleUrl: './chart-skeleton.component.scss',
  host: {
    'aria-hidden': 'true',
    '[style.--_chart-skeleton-plot-height]': 'plotHeight()',
    '[style.--_chart-skeleton-value-space.px]': 'valueSpace()',
    '[style.--_chart-skeleton-axis-gutter.px]': 'axisGutter()',
    '[style.--_chart-skeleton-category-band.px]': 'categoryBand',
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartSkeletonComponent {
  readonly marks = input<ChartSkeletonMarks>('columns');
  readonly count = input.required<number>();
  /** A CSS length, so a chart can pass its own height token. */
  readonly plotHeight = input.required<string>();
  readonly valueSpace = input.required<number>();
  readonly axisGutter = input.required<number>();
  readonly shimmer = input(true);

  protected readonly ticks = TICK_POSITIONS;
  protected readonly categoryBand = CHART_SKELETON_CATEGORY_BAND;

  protected readonly bars = computed(() =>
    this.marks() === 'steps'
      ? skeletonWaterfallSteps(this.count()).map(({ bottom, height }) => ({
          bottom: `${bottom * 100}%`,
          height: `${height * 100}%`,
        }))
      : skeletonColumnHeights(this.count()).map((height) => ({
          bottom: '0',
          height: `${height * 100}%`,
        })),
  );

  protected readonly lineClip = computed(() => skeletonLineClip(this.count()));
}
