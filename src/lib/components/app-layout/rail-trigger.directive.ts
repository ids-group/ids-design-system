import { Directive, inject } from '@angular/core';
import { AppLayoutComponent } from './app-layout.component';

/**
 * Wires a consumer's own burger to the layout's overlay rail: toggles
 * `[(railOpen)]` on click and keeps `aria-expanded` / `aria-controls` in sync, so
 * the trigger and the panel are related for a screen reader.
 *
 * ```html
 * <ds-app-layout>
 *   <ds-topbar topbar>
 *     <button dsRailTrigger type="button" aria-label="Navigation">☰</button>
 *   </ds-topbar>
 * </ds-app-layout>
 * ```
 *
 * PUT IT ON THE FOCUSABLE CONTROL, not on a wrapper: on `<ds-icon-button>` the
 * host is the wrapper, not the inner `<button>`. With a DS button, skip this
 * directive and bind its forwarding inputs instead:
 * `[ariaExpanded]="layout.railOverlay() ? layout.railOpen() : null"`,
 * `[ariaControls]="layout.railOverlay() ? layout.railId : null"` and
 * `(pressed)="layout.railOpen.set(!layout.railOpen())"` off a
 * `<ds-app-layout #layout>` template ref.
 *
 * Both attributes are dropped while the rail is NOT an overlay, since
 * `aria-expanded="false"` would misstate a permanently visible rail.
 *
 * Must sit inside a `ds-app-layout`.
 */
@Directive({
  selector: '[dsRailTrigger]',
  standalone: true,
  host: {
    '[attr.aria-expanded]': 'layout.railOverlay() ? layout.railOpen() : null',
    '[attr.aria-controls]': 'layout.railOverlay() ? layout.railId : null',
    '(click)': 'toggle()',
  },
})
export class RailTriggerDirective {
  protected readonly layout = inject(AppLayoutComponent);

  protected toggle(): void {
    this.layout.railOpen.update((open) => !open);
  }
}
