import { Directive, booleanAttribute, input } from '@angular/core';
import { resolveReserveMessage } from './field-defaults';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
import { trimmedText } from './field-errors';

/**
 * The inputs of anything that renders a `ds-field-message` line — the message half
 * of a field, split out so `ds-button` can take it without also taking `errors`,
 * `invalid` and `touched`, which describe a form control's validation state and
 * mean nothing on a button.
 *
 * `@Directive()` is required, not decoration: Angular refuses to compile a base
 * class that declares inputs without it.
 * @internal
 */
@Directive()
export abstract class DsMessageBase {
  /** Helper text shown below the control. */
  readonly hint = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** Error text. Shown immediately — binding it says the consumer has already
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
   *  True for a field, whose row reserves so its neighbours do not shift; `ds-button`
   *  turns it off, because a button is not in that column and an app-wide field
   *  setting would otherwise give every button an empty message row. Read lazily, so
   *  a subclass initializer running after this one still decides it. */
  protected readonly reserveFollowsFieldDefault: boolean = true;

  readonly reserveMessageResolved = resolveReserveMessage(
    this.reserveMessage,
    () => this.reserveFollowsFieldDefault,
  );
}
