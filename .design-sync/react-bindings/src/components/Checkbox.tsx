import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';
import { FieldMessage, type FieldMessageState } from '../lib/FieldMessage';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps {
  /** Checked state. Controlled when `onCheckedChange` is provided; otherwise
   *  the component manages its own state seeded from this value. */
  checked?: boolean;
  /** Emits the new checked state on every toggle. */
  onCheckedChange?: (checked: boolean) => void;
  /** Shows the partial/mixed visual state — independent of `checked`. */
  indeterminate?: boolean;
  /** Disables the checkbox and blocks all interaction. */
  disabled?: boolean;
  /** Native `name` attribute. */
  name?: string;
  /** Overrides the generated id used by the native `<input>` and its `<label for>`. */
  inputId?: string;
  /** Applies error styling and marks the input `aria-invalid`. */
  invalid?: boolean;
  /** Helper text shown below the checkbox. */
  hint?: string;
  /** Checkbox size — sm/md/lg. Default 'md'. */
  size?: CheckboxSize;
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Inline label rendered beside the box and wired via for/id. Omit to
   *  bring your own <label>. */
  label?: string;
}

/** Checkbox with inline label and hint — port of `ds-checkbox`. */
export function Checkbox({
  checked,
  onCheckedChange,
  indeterminate = false,
  disabled = false,
  name,
  inputId,
  invalid = false,
  hint = '',
  size = 'md',
  required = false,
  label = '',
}: CheckboxProps) {
  const [uid] = React.useState(() => nextControlId('ds-checkbox'));
  const [ownChecked, setOwnChecked] = React.useState(checked ?? false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isChecked = onCheckedChange ? (checked ?? false) : ownChecked;
  const setChecked = (v: boolean) => {
    if (!onCheckedChange) setOwnChecked(v);
    onCheckedChange?.(v);
  };

  // `indeterminate` is a DOM property, not an attribute — mirror it via ref.
  React.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const controlId = inputId ?? uid;
  const hintId = hint ? `${uid}-hint` : undefined;
  const messageState: FieldMessageState = invalid ? 'error' : 'default';

  return host(
    'ds-checkbox',
    null,
    <div className={`checkbox-field size-${size}`}>
      <span className={cx('control-line', disabled && 'is-disabled')}>
        <input
          ref={inputRef}
          type="checkbox"
          className="check"
          checked={isChecked}
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
