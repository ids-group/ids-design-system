import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  input,
  output,
} from '@angular/core';
import { LoadingOverlayComponent } from '@ids-group-ltd/ids-design-system/components/loading-overlay';
import { SkeletonComponent } from '@ids-group-ltd/ids-design-system/components/skeleton';
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

      @if (dataTable()) {
        <details class="data-table" aria-hidden="true" inert>
          <summary>
            <ds-skeleton
              inline
              class="data-table-label"
              width="var(--space-16)"
              height="var(--space-2)"
              [shimmer]="shimmer()" />
          </summary>
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
export class ChartStatesComponent {
  readonly unpin = input(true, { transform: booleanAttribute });
  readonly pinned = input(false);
  readonly release = output();

  readonly caption = input<string | null>(null);
  readonly error = input(false);
  readonly errorText = input('');
  /** Draws `skeleton` in place of `body`: there is nothing to draw yet. */
  readonly pending = input(false);
  /** Holds the room of the chart's data-table disclosure under the skeleton. */
  readonly dataTable = input(false);
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
}
