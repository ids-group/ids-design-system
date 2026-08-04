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
 *     <ds-icon-button dsRailTrigger icon="menu" ariaLabel="Navigation" />
 *   </ds-topbar>
 * </ds-app-layout>
 * ```
 *
 * A directive rather than documentation because these are exactly the attributes
 * a consumer forgets — the DS itself shipped the rail without them.
 *
 * Both attributes are dropped while the rail is NOT an overlay: above the
 * breakpoint the rail is permanently in the layout, so `aria-expanded="false"`
 * would state the opposite of what the user sees.
 *
 * Must sit inside a `ds-app-layout` — the injector walks the declaration tree, so
 * anywhere in the projected chrome works. Outside one, DI fails naming
 * `AppLayoutComponent`, which says what is missing.
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
