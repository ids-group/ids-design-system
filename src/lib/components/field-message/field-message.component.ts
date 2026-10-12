import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
import {
  DS_CONFIG,
  DS_INTL,
  DS_INTL_DEFAULTS,
} from '@ids-group-ltd/ids-design-system/core';

/** @internal */
export type FieldMessageState = 'default' | 'error' | 'warning' | 'success';

/** Helper/error line for form fields. Renders nothing when `text` is empty. The host field owns
 *  the `aria-describedby` relationship and passes `messageId`.
 * @internal
 */
@Component({
  selector: 'ds-field-message',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet],
  templateUrl: './field-message.component.html',
  styleUrl: './field-message.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class FieldMessageComponent {
  /** The one line under a field. Empty renders nothing (or reserved space, if the field asks). */
  readonly text = input<string>('');
  /** Hint, error, warning or success; decides the colour. */
  readonly state = input<FieldMessageState>('default');
  /** Id the field's `aria-describedby` points at. */
  readonly messageId = input<string | null>(null);
  /** Leading glyph. Unset resolves from the state via `DS_CONFIG.field.stateIcons` (error,
   *  warning and success carry one by default, hint does not). A name overrides it; `false`
   *  removes it. */
  readonly icon = input<IconName | false | null>(null);
  /** Reserves one line of height with no `text`, so the layout below does not shift. */
  readonly reserve = input(false, { transform: booleanAttribute });
  /** Appends the "Changed" mark of a field under `showDirty`, inside the described element. */
  readonly changed = input(false, { transform: booleanAttribute });

  private readonly intl = inject(DS_INTL);
  protected readonly changedText = computed(
    () => this.intl().field.changed ?? DS_INTL_DEFAULTS.field.changed,
  );

  private readonly config = inject(DS_CONFIG);

  /** Keyed `hint` in the config, not `default`, which would read as "the default icon". */
  private static readonly BUILT_IN: Record<
    FieldMessageState,
    IconName | false
  > = {
    error: 'error',
    warning: 'warn',
    success: 'success',
    default: false,
  };

  protected readonly iconResolved = computed<IconName | null>(() => {
    const own = this.icon();
    if (own !== null) {
      return own === false ? null : own;
    }
    const configured = this.config.field?.stateIcons;
    if (configured === false) {
      return null;
    }
    const state = this.state();
    const key = state === 'default' ? 'hint' : state;
    const resolved = configured?.[key] ?? FieldMessageComponent.BUILT_IN[state];

    return resolved === false ? null : resolved;
  });
}
