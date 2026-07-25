import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';
import { FieldMessage, type FieldMessageState } from '../lib/FieldMessage';
import { RadioGroupContext, type RadioGroupEntry, type RadioValue } from './RadioGroup';

export type RadioSize = 'sm' | 'md' | 'lg';

export interface RadioProps {
  /** Standalone checked state. Controlled when `onCheckedChange` is provided;
   *  otherwise the component manages its own state seeded from this value.
   *  Inside a `RadioGroup` the checked state is derived from the group value
   *  instead and this prop is ignored. */
  checked?: boolean;
  /** Emits `true` when the radio is selected (standalone use only — radios
   *  never uncheck themselves). */
  onCheckedChange?: (checked: boolean) => void;
  /** Disables the radio; a disabled parent `RadioGroup` also disables it. */
  disabled?: boolean;
  /** Native `name` attribute — overridden by the group's name when inside `RadioGroup`. */
  name?: string;
  /** Value compared against the group's selection when inside `RadioGroup`. */
  value?: RadioValue;
  /** Overrides the auto-generated id used for the input and its label's `for`. */
  inputId?: string;
  /** Applies error styling and marks the input `aria-invalid`. */
  invalid?: boolean;
  /** Helper text shown below the control. */
  hint?: string;
  /** Control size — sm/md/lg. Default 'md'. */
  size?: RadioSize;
  /** Marks the radio required — shows an asterisk on the label and sets `aria-required`. */
  required?: boolean;
  /** Inline label rendered beside the dot and wired via for/id. Omit to bring
   *  your own <label>. */
  label?: string;
}

/** Radio button — port of `ds-radio`. Standalone via `checked`, or place
 *  inside `RadioGroup` where name/selection/disabled come from the group. */
export function Radio({
  checked,
  onCheckedChange,
  disabled = false,
  name = '',
  value = '',
  inputId,
  invalid = false,
  hint = '',
  size = 'md',
  required = false,
  label = '',
}: RadioProps) {
  const [uid] = React.useState(() => nextControlId('ds-radio'));
  const [ownChecked, setOwnChecked] = React.useState(checked ?? false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const group = React.useContext(RadioGroupContext);

  const effectiveDisabled = (group?.disabled ?? false) || disabled;
  const effectiveName = group ? group.name : name;
  const standaloneChecked = onCheckedChange ? (checked ?? false) : ownChecked;
  const isChecked = group ? group.value === value : standaloneChecked;

  // Register with the group for arrow-key navigation / focus-follows-selection.
  const entryRef = React.useRef<RadioGroupEntry>({ value, disabled: effectiveDisabled, input: null });
  entryRef.current.value = value;
  entryRef.current.disabled = effectiveDisabled;
  React.useEffect(() => {
    entryRef.current.input = inputRef.current;
  });
  const register = group?.register;
  React.useEffect(() => {
    if (!register) return;
    return register(entryRef.current);
  }, [register]);

  // Roving tabindex: standalone radios are always tabbable; inside a group
  // only the checked radio is (when nothing is selected, enabled radios stay
  // tabbable — a slight relaxation of the Angular "first enabled only" rule).
  const tabIndex = !group
    ? 0
    : group.value != null
      ? isChecked
        ? 0
        : -1
      : effectiveDisabled
        ? -1
        : 0;

  const controlId = inputId ?? uid;
  const hintId = hint ? `${uid}-hint` : undefined;
  const messageState: FieldMessageState = invalid ? 'error' : 'default';

  const onSelect = () => {
    if (effectiveDisabled) return;
    if (group) {
      group.select(value);
    } else {
      if (!onCheckedChange) setOwnChecked(true);
      onCheckedChange?.(true);
    }
  };

  return host(
    'ds-radio',
    null,
    <div className={`radio-field size-${size}`}>
      <span className={cx('control-line', effectiveDisabled && 'is-disabled')}>
        <input
          ref={inputRef}
          type="radio"
          className="radio"
          checked={isChecked}
          disabled={effectiveDisabled}
          name={effectiveName || undefined}
          value={value}
          id={controlId}
          tabIndex={tabIndex}
          aria-invalid={invalid ? 'true' : undefined}
          aria-describedby={hintId}
          aria-required={required ? 'true' : undefined}
          onChange={onSelect}
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
