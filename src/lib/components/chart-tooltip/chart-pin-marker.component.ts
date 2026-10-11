import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ICONS } from '@ids-group-ltd/ids-design-system/core';

/** Radius of the pin disc, in plot pixels.
 *
 *  @internal */
export const CHART_PIN_RADIUS = 11;

/** Gap between a disc and the top edge of what it holds.
 *
 *  @internal */
export const CHART_PIN_GAP = 8;

const GLYPH_SIZE = 14;

/**
 * The disc an SVG chart draws on the mark or category it holds. Drawn, not composed:
 * `ds-icon`'s host is an element SVG does not know, which renders nothing inside a canvas.
 * Centred on the host's origin; place it with a `transform`.
 *
 * @internal
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'g[dsChartPinMarker]',
  standalone: true,
  template: `
    <svg:g class="pin-body">
      <svg:circle class="pin-disc" [attr.r]="radius" />

      <svg:svg
        class="pin-glyph"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        [attr.x]="glyphOffset"
        [attr.y]="glyphOffset"
        [attr.width]="glyphSize"
        [attr.height]="glyphSize"
        [innerHTML]="glyph" />
    </svg:g>
  `,
  styles: `
    :host {
      pointer-events: none;
      transition: transform var(--ds-motion-chart-mark-duration)
        var(--ds-motion-chart-mark-easing);
    }

    /* On a child: the host transform places the disc, and a scale there would scale the offset too. */
    .pin-body {
      animation: pin-pop var(--ds-motion-chart-mark-duration) var(--ease-spring)
        backwards;
    }

    @keyframes pin-pop {
      from {
        scale: 0.4;
        opacity: 0;
      }
    }

    .pin-disc {
      fill: var(--surface-default);
      stroke: var(--border-divider);
      stroke-width: var(--border-width-default);
    }

    .pin-glyph {
      color: var(--text-primary);
    }
  `,
  host: {
    class: 'pin-marker',
    'aria-hidden': 'true',
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartPinMarkerComponent {
  protected readonly radius = CHART_PIN_RADIUS;
  protected readonly glyphSize = GLYPH_SIZE;
  protected readonly glyphOffset = -GLYPH_SIZE / 2;
  protected readonly glyph: SafeHtml = inject(
    DomSanitizer,
  ).bypassSecurityTrustHtml(ICONS.pin);
}
