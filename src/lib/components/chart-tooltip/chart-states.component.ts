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
  imports: [ChartUnpinComponent, NgTemplateOutlet],
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
      <ng-container [ngTemplateOutlet]="body()" />
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
  readonly pending = input(false);
  readonly empty = input(false);
  readonly emptyText = input('');

  /** Draws the axis L along the message box's start and bottom edges. */
  readonly messageAxes = input(false, { transform: booleanAttribute });

  readonly skeleton = input.required<TemplateRef<unknown>>();
  readonly body = input.required<TemplateRef<unknown>>();
  /** Replaces the default error and empty paragraph. */
  readonly message = input<TemplateRef<ChartStatesMessageContext> | null>(null);
}
