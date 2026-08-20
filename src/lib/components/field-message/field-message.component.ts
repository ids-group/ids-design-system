import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';

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
  /** Leading glyph. There is no per-state default: `state` sets the colour only, so
   *  a field that wants an icon passes one. */
  readonly icon = input<IconName | null>(null);
  /** Reserve one line of height even when there's no `text`, so a field that
   *  gains/loses a message doesn't shift the layout below it. */
  readonly reserve = input(false, { transform: booleanAttribute });
}
