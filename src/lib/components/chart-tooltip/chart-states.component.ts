import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  input,
  output,
  signal,
  type OnChanges,
  type SimpleChanges,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoadingOverlayComponent } from '@ids-group-ltd/ids-design-system/components/loading-overlay';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
import type { ChartDataTable } from '@ids-group-ltd/ids-design-system/core';
import { CHART_SKELETON_COUNT } from '@ids-group-ltd/ids-design-system/components';
import {
  startSkeletonMorph,
  type ChartMorphGrowth,
} from './chart-skeleton-morph';
import { ChartUnpinComponent } from './chart-unpin.component';

/**
 * Context of a chart's own `message` template: the text, and whether it reports an error.
 *
 * @internal
 */
export interface ChartStatesMessageContext {
  readonly $implicit: string;
  readonly error: boolean;
}

/**
 * The Unpin control, caption and error / loading / empty states every chart draws, then `body`.
 * It sits on the chart's own `<figure>` so the caption stays the figure's direct child, which is
 * what names the figure. `skeleton`, `body` and `message` are declared in the chart's template
 * and keep its styles; the message box takes its height from an inherited
 * `--_chart-message-height`.
 *
 * @internal
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'figure[dsChartStates]',
  standalone: true,
  imports: [
    ChartUnpinComponent,
    LoadingOverlayComponent,
    NgTemplateOutlet,
    SkeletonComponent,
  ],
  template: `
    @if (unpin()) {
      <ds-chart-unpin [pinned]="pinned()" (release)="release.emit()" />
    }

    @if (caption()) {
      <figcaption>
        {{ caption() }}
      </figcaption>
    }

    @if (error()) {
      @if (message(); as messageTemplate) {
        <ng-container
          [ngTemplateOutlet]="messageTemplate"
          [ngTemplateOutletContext]="{ $implicit: errorText(), error: true }" />
      } @else {
        <p class="empty is-error" role="status">
          {{ errorText() }}
        </p>
      }
    } @else if (pending()) {
      <ng-container [ngTemplateOutlet]="skeleton()" />

      @if (dataTable() !== 'none') {
        <details
          class="data-table"
          aria-hidden="true"
          inert
          [open]="dataTable() === 'visible'">
          <summary>
            <ds-skeleton
              inline
              class="data-table-label"
              width="var(--space-16)"
              height="var(--space-2)"
              [shimmer]="shimmer()" />
          </summary>

          @if (dataTable() === 'visible') {
            <table>
              <thead>
                <tr>
                  <th>
                    <ds-skeleton
                      inline
                      class="data-table-label"
                      width="var(--space-12)"
                      height="var(--space-2)"
                      [shimmer]="shimmer()" />
                  </th>
                  <th>
                    <ds-skeleton
                      inline
                      class="data-table-label"
                      width="var(--space-8)"
                      height="var(--space-2)"
                      [shimmer]="shimmer()" />
                  </th>
                </tr>
              </thead>

              <tbody>
                @for (row of placeholderRows; track $index) {
                  <tr>
                    <td>
                      <ds-skeleton
                        inline
                        class="data-table-label"
                        width="var(--space-20)"
                        height="var(--space-2)"
                        [shimmer]="shimmer()" />
                    </td>
                    <td>
                      <ds-skeleton
                        inline
                        class="data-table-label"
                        width="var(--space-10)"
                        height="var(--space-2)"
                        [shimmer]="shimmer()" />
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </details>
      }
    } @else if (empty()) {
      @if (message(); as messageTemplate) {
        <ng-container
          [ngTemplateOutlet]="messageTemplate"
          [ngTemplateOutletContext]="{
            $implicit: emptyText(),
            error: false,
          }" />
      } @else {
        <p class="empty">
          {{ emptyText() }}
        </p>
      }
    } @else {
      <ds-loading-overlay
        class="reload-overlay"
        [loading]="reloading()"
        [blur]="true">
        <ng-container [ngTemplateOutlet]="body()" />
      </ds-loading-overlay>
    }
  `,
  styleUrl: './chart-states.component.scss',
  host: { '[class.message-axes]': 'messageAxes()' },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartStatesComponent implements OnChanges {
  readonly unpin = input(true, { transform: booleanAttribute });
  readonly pinned = input(false);
  readonly release = output();

  readonly caption = input<string | null>(null);
  readonly error = input(false);
  readonly errorText = input('');
  /** Draws `skeleton` in place of `body`: there is nothing to draw yet. */
  readonly pending = input(false);
  /** Holds the room of the chart's data-table disclosure under the skeleton, open under `'visible'`. */
  readonly dataTable = input<ChartDataTable>('none');
  /** Whether the data-table placeholder shimmers, as the chart's own skeleton does. */
  readonly shimmer = input(true);
  /** Keeps `body` on screen under a loading overlay bound to it, the caption left uncovered. */
  readonly reloading = input(false);
  readonly empty = input(false);
  readonly emptyText = input('');

  /** Draws the axis L along the message box's start and bottom edges. */
  readonly messageAxes = input(false, { transform: booleanAttribute });

  readonly skeleton = input.required<TemplateRef<unknown>>();
  readonly body = input.required<TemplateRef<unknown>>();
  /** Replaces the default error and empty paragraph. */
  readonly message = input<TemplateRef<ChartStatesMessageContext> | null>(null);

  /** How a mark the loading skeleton had no placeholder for arrives when the data lands. */
  readonly morphGrowth = input<ChartMorphGrowth>(null);

  protected readonly placeholderRows = Array.from({ length: CHART_SKELETON_COUNT });

  private readonly morphingState = signal(false);
  /** Whether the loading skeleton is turning into the drawn chart; a chart animating its own marks
   *  starts them from the skeleton while it is. */
  readonly morphing = this.morphingState.asReadonly();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private stopMorph: () => void = () => undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopMorph());
  }

  // Before the view swaps the skeleton out, while its placeholders can still be measured.
  ngOnChanges(changes: SimpleChanges): void {
    const pending = changes['pending'];
    if (!pending || pending.firstChange) {
      return;
    }
    this.stopMorph();
    if (
      !pending.previousValue ||
      pending.currentValue ||
      !this.isBrowser ||
      this.error() ||
      this.empty()
    ) {
      return;
    }
    const stop = this.zone.runOutsideAngular(() =>
      startSkeletonMorph(this.host.nativeElement, this.morphGrowth(), () =>
        this.morphingState.set(false),
      ),
    );
    if (stop) {
      this.stopMorph = stop;
      this.morphingState.set(true);
    }
  }
}
