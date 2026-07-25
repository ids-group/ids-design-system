import * as React from 'react';
import { host } from './util';
import { Icon, type IconName } from './Icon';

export type FieldMessageState = 'default' | 'error' | 'success';

export interface FieldMessageProps {
  text?: string;
  state?: FieldMessageState;
  messageId?: string;
  icon?: IconName;
}

/** Internal shared helper/error line for form fields — port of
 *  `ds-field-message`. Renders nothing when `text` is empty. The host field
 *  owns the `aria-describedby` relationship and passes `messageId`. */
export function FieldMessage({ text = '', state = 'default', messageId, icon }: FieldMessageProps) {
  if (!text) return host('ds-field-message', null);
  return host(
    'ds-field-message',
    null,
    <span
      className={`field-message ${state}`}
      role={state === 'error' ? 'alert' : undefined}
      id={messageId}
    >
      {icon && <Icon name={icon} size={14} />}
      {text}
    </span>,
  );
}
