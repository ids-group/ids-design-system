import { Component, ViewEncapsulation, input } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';

export type FieldMessageState = 'default' | 'error' | 'success';

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
  readonly text = input<string>('');
  readonly state = input<FieldMessageState>('default');
  readonly messageId = input<string | null>(null);
  readonly icon = input<IconName | null>(null);
}
