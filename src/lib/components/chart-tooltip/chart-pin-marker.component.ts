import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ICONS } from '@ids-group-ltd/ids-design-system/core';

/** Radius of the pin disc, in plot pixels. A mark that places a disc inside itself keeps this
 *  much room from its edge.
 *
 *  @internal */
export const CHART_PIN_RADIUS = 11;

/** How far a disc sits inside the top edge of what it holds. At one radius it sits flush against
 *  the edge and reads as part of the mark rather than as a badge on it.
 *
 *  @internal */
export const CHART_PIN_GAP = 4;

const GLYPH_SIZE = 14;

/**
 * The disc an SVG chart draws on the mark or category it holds. Drawn rather than composed:
 * `ds-icon`'s host is an HTML element, and an element the SVG specification does not know renders
 * nothing inside a canvas. The opaque disc is what keeps the glyph legible on any series colour.
 * Centred on the host's origin; place it with a `transform`.
 *
 * @internal
 */
@Component({
  // An element selector cannot work inside a canvas: an element the SVG specification does not
  // know renders nothing, and neither do its children.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'g[dsChartPinMarker]',
  standalone: true,
  template: `
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
  `,
  styles: `
    :host {
      pointer-events: none;
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
