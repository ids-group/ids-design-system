import { Directive } from '@angular/core';
import {
  DS_CONFIG,
  inheritDsConfig,
} from '@ids-group-ltd/ids-design-system/core';

/**
 * Turns on `reserveMessage` for every DS field declared inside the host
 * element, so a validated form holds its message rows without repeating the
 * input on each control:
 *
 * ```html
 * <form dsReserveMessages>
 *   <ds-input label="Email" />
 *   <ds-input label="Password" />
 * </form>
 * ```
 *
 * It provides `DS_CONFIG`, which merges with the config above it — scoping this
 * one flag cannot drop unrelated app-level settings. A field's own
 * `[reserveMessage]` still wins, so a single control can opt back out.
 *
 * The switch is the directive's PRESENCE, not an input: providers are resolved
 * at construction, before inputs are set, so a bound value could not drive
 * them. To turn it off for a subtree, provide the config directly:
 * `provideDsConfig({ field: { reserveMessage: false } })`.
 *
 * Applies to fields DECLARED inside the host — projected content keeps the
 * injector of the template it was written in, so wrapping `<ng-content>` in
 * this directive does not reach the projected fields.
 */
@Directive({
  selector: '[dsReserveMessages]',
  standalone: true,
  // Object literal + arrow, NOT provideDsConfig(...): a call in decorator
  // metadata runs at module-evaluation time, which marks the module
  // side-effectful and cost the consumer its tree-shaking of the barrel (measured at
  // +566 kB moved into the eager chunk).
  providers: [
    {
      provide: DS_CONFIG,
      useFactory: () => inheritDsConfig({ field: { reserveMessage: true } }),
    },
  ],
})
export class ReserveMessagesDirective {}
