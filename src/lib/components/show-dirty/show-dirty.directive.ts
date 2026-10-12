import { Directive } from '@angular/core';
import {
  DS_CONFIG,
  inheritDsConfig,
} from '@ids-group-ltd/ids-design-system/core';

/**
 * Turns on `showDirty` for every DS field declared inside the host element, so a changed value
 * carries a dot and a "Changed" line:
 *
 * ```html
 * <form dsShowDirty>
 *   <ds-input label="Company" />
 *   <ds-select label="City" />
 * </form>
 * ```
 *
 * It provides `DS_CONFIG`, which merges with the config above it. A field's own `[showDirty]`
 * still wins.
 *
 * The switch is the directive's presence, not an input: providers resolve before inputs are
 * set. To turn it off for a subtree, provide the config directly:
 * `provideDsConfig({ field: { showDirty: false } })`.
 *
 * Applies to fields declared inside the host; projected content keeps the injector of the
 * template it was written in.
 */
@Directive({
  selector: '[dsShowDirty]',
  standalone: true,
  // Object literal + arrow, not provideDsConfig(...): see ReserveMessagesDirective.
  providers: [
    {
      provide: DS_CONFIG,
      useFactory: () => inheritDsConfig({ field: { showDirty: true } }),
    },
  ],
})
export class ShowDirtyDirective {}
