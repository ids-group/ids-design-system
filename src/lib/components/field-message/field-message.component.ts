import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';
import { DS_CONFIG } from '../../config/ds-config';

export type FieldMessageState = 'default' | 'error' | 'warning' | 'success';

/** Internal shared helper/error line for form fields. Renders nothing when
 *  `text` is empty. The host field owns the `aria-describedby` relationship
 *  and passes `messageId`; this only renders the element that carries it. */
@Component({
  selector: 'ds-field-message',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './field-message.component.html',
  styleUrl: './field-message.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class FieldMessageComponent {
  /** The one line under a field. Empty renders nothing (or reserved space, if the field asks). */
  readonly text = input<string>('');
  /** Which role the line is playing — hint, error, warning or success. Decides the colour. */
  readonly state = input<FieldMessageState>('default');
  /** Id the field points `aria-describedby` at, so the message is announced with the control. */
  readonly messageId = input<string | null>(null);
  /** Leading glyph. Unset resolves from the state through
   *  `DS_CONFIG.field.stateIcons` — error, warning and success carry one by default and
   *  the hint line does not. A name here overrides that for this message; `false`
   *  removes it. */
  readonly icon = input<IconName | false | null>(null);
  /** Reserve one line of height even when there's no `text`, so a field that
   *  gains/loses a message doesn't shift the layout below it. */
  readonly reserve = input(false, { transform: booleanAttribute });

  private readonly config = inject(DS_CONFIG);

  /** `hint` rather than `default` in the config: every field calls this line a hint,
   *  and `default` would read as "the default icon". */
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
