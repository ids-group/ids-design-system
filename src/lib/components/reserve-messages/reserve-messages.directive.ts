import { Directive } from '@angular/core';
import {
  DS_CONFIG,
  inheritDsConfig,
} from '@ids-group-ltd/ids-design-system/core';

/**
 * Turns on `reserveMessage` for every DS field declared inside the host element:
 *
 * ```html
 * <form dsReserveMessages>
 *   <ds-input label="Email" />
 *   <ds-input label="Password" />
 * </form>
 * ```
 *
 * It provides `DS_CONFIG`, which merges with the config above it. A field's own
 * `[reserveMessage]` still wins.
 *
 * The switch is the directive's presence, not an input: providers resolve before inputs are
 * set. To turn it off for a subtree, provide the config directly:
 * `provideDsConfig({ field: { reserveMessage: false } })`.
 *
 * Applies to fields declared inside the host; projected content keeps the injector of the
 * template it was written in.
 */
@Directive({
  selector: '[dsReserveMessages]',
  standalone: true,
  // Object literal + arrow, not provideDsConfig(...): a call in decorator metadata runs at
  // module evaluation, marks the module side-effectful and defeats tree-shaking of the barrel.
  providers: [
    {
      provide: DS_CONFIG,
      useFactory: () => inheritDsConfig({ field: { reserveMessage: true } }),
    },
  ],
})
export class ReserveMessagesDirective {}
