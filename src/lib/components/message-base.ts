import { Directive, booleanAttribute, input } from '@angular/core';
import { resolveReserveMessage } from './field-defaults';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
import { trimmedText } from './field-errors';

/**
 * The inputs of anything that renders a `ds-field-message` line. Split from `DsFieldBase` so
 * `ds-button` can take it without `errors`, `invalid` and `touched`.
 * @internal
 */
@Directive()
export abstract class DsMessageBase {
  /** Helper text shown below the control. */
  readonly hint = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** Error text. Shown immediately - binding it says the consumer has already
   *  decided this is in error. Takes precedence over `errors`. */
  readonly error = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** Advisory text, shown when there is no error. */
  readonly warning = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** Reserve the message-row height even when empty, so the control doesn't shift
   *  the layout below it when a hint/error appears. What an unset value falls back
   *  to is the subclass's call, in `reserveMessageResolved`: a field takes
   *  `DS_CONFIG.field.reserveMessage`, a button does not. */
  readonly reserveMessage = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });

  /** Glyph on the message line, overriding what the state resolves to. Unset
   *  follows `DS_CONFIG.field.stateIcons`; `false` removes the glyph here alone. */
  readonly messageIcon = input<IconName | false | null>(null);

  /** Whether an unset `reserveMessage` falls back to `DS_CONFIG.field.reserveMessage`.
   *  `ds-button` turns it off, or an app-wide field setting would give every button an
   *  empty message row. Read lazily, so a subclass initializer running later still decides it. */
  protected readonly reserveFollowsFieldDefault: boolean = true;

  readonly reserveMessageResolved = resolveReserveMessage(
    this.reserveMessage,
    () => this.reserveFollowsFieldDefault,
  );
}
