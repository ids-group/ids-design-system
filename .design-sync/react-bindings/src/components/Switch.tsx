import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';
import { FieldMessage, type FieldMessageState } from '../lib/FieldMessage';

export type SwitchSize = 'sm' | 'md' | 'lg';
export type SwitchVariant = 'default' | 'success' | 'error';

export interface SwitchProps {
  /** On/off state. Controlled when `onCheckedChange` is provided; otherwise
   *  the component manages its own state seeded from this value. */
  checked?: boolean;
  /** Emits the new on/off state on every toggle. */
  onCheckedChange?: (checked: boolean) => void;
  /** Disables the switch and blocks all interaction. */
  disabled?: boolean;
  /** Native `name` attribute. */
  name?: string;
  /** Track colour when checked. Default 'default'. */
  variant?: SwitchVariant;
  /** Overrides the generated id used by the native `<input>` and its `<label for>`. */
  inputId?: string;
  /** Applies error styling and marks the input `aria-invalid`. */
  invalid?: boolean;
  /** Helper text shown below the switch. */
  hint?: string;
  /** Switch size — sm/md/lg. Default 'md'. */
  size?: SwitchSize;
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Inline label rendered beside the track and wired via for/id. Omit to
   *  bring your own <label>. */
  label?: string;
}

/** Toggle switch — port of `ds-switch`. A checkbox with `role="switch"`
 *  styled as a sliding track; use for instant on/off settings. */
export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  name,
  variant = 'default',
  inputId,
  invalid = false,
  hint = '',
  size = 'md',
  required = false,
  label = '',
}: SwitchProps) {
  const [uid] = React.useState(() => nextControlId('ds-switch'));
  const [ownChecked, setOwnChecked] = React.useState(checked ?? false);
  const isChecked = onCheckedChange ? (checked ?? false) : ownChecked;
  const setChecked = (v: boolean) => {
    if (!onCheckedChange) setOwnChecked(v);
    onCheckedChange?.(v);
  };

  const controlId = inputId ?? uid;
  const hintId = hint ? `${uid}-hint` : undefined;
  const messageState: FieldMessageState = invalid ? 'error' : 'default';
  const switchClasses = cx('switch', variant !== 'default' && variant);

  return host(
    'ds-switch',
    null,
    <div className={`switch-field size-${size}`}>
      <span className={cx('control-line', disabled && 'is-disabled')}>
        <input
          type="checkbox"
          role="switch"
          className={switchClasses}
          checked={isChecked}
          aria-checked={isChecked}
          disabled={disabled}
          name={name}
          id={controlId}
          aria-invalid={invalid ? 'true' : undefined}
          aria-describedby={hintId}
          aria-required={required ? 'true' : undefined}
          onChange={(e) => setChecked(e.target.checked)}
        />
        {label && (
          <label className="control-text" htmlFor={controlId}>
            {label}
            {required && (
              <span className="req" aria-hidden="true">*</span>
            )}
          </label>
        )}
      </span>
      <FieldMessage text={hint} state={messageState} messageId={hintId} />
    </div>,
  );
}
