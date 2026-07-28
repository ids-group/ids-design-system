import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';
import { Icon } from '../lib/Icon';
import { FieldMessage, type FieldMessageState } from '../lib/FieldMessage';
import { Spinner } from './Spinner';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

export interface InputProps {
  /** Text value. Controlled when `onValueChange` is provided; otherwise the
   *  component manages its own state seeded from this value. */
  value?: string;
  /** Emits the new value on every keystroke (and on clear). */
  onValueChange?: (value: string) => void;
  /** Native input type — also affects the default clear button and password toggle. */
  type?: InputType;
  /** Field height — sm/md/lg. Default 'md'. */
  size?: InputSize;
  /** Label shown above the field, or inside it when `floating`. */
  label?: string;
  /** Helper text shown below the field. */
  hint?: string;
  /** Placeholder shown when empty. */
  placeholder?: string;
  /** Disables the field and blocks all interaction. */
  disabled?: boolean;
  /** Prevents editing while still allowing focus and selection. */
  readOnly?: boolean;
  /** Applies error styling and marks the field `aria-invalid`. */
  invalid?: boolean;
  /** Applies success styling to the field. */
  success?: boolean;
  /** Shows a trailing spinner — e.g. async validation in flight. Pair with a
   *  `hint` like "Checking availability…". */
  loading?: boolean;
  /** Floating-label variant — the label sits inside a taller control. */
  floating?: boolean;
  /** Reserves space for a leading addon (the `[dsInputPrefix]` slot). */
  withAddon?: boolean;
  /** Reserves space for a trailing addon (the `[dsInputSuffix]` slot). */
  withAddonRight?: boolean;
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Shows an "(optional)" marker next to the label (ignored when `required`). */
  optional?: boolean;
  /** Native `name` attribute. */
  name?: string;
  /** Native `min` attribute — applies when `type="number"`. */
  min?: number;
  /** Native `max` attribute — applies when `type="number"`. */
  max?: number;
  /** Native `step` attribute — applies when `type="number"`. */
  step?: number;
  /** Native autocomplete token (e.g. "email", "current-password"). */
  autocomplete?: string;
  /** Focuses the field automatically on render. */
  autofocus?: boolean;
  /** Accessible name when no visible `label` is provided. */
  ariaLabel?: string;
  /** Hard character cap — native maxlength + a live "{current}/{max}" counter. */
  maxLength?: number;
  /** Mobile keyboard hint — forwarded to the native input. */
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  /** Native `inputmode` attribute — hints the on-screen keyboard layout. */
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  /** Show an inline clear (×) button when non-empty. Defaults to true when
   *  `type="search"`, false otherwise. */
  clearable?: boolean;
  /** Shows a show/hide button when `type="password"`. */
  passwordToggle?: boolean;
  /** Reveals the password. Controlled when `onPasswordVisibleChange` is
   *  provided; otherwise seeds the internal state (a design can show the
   *  revealed state statically). */
  passwordVisible?: boolean;
  /** Emits the new reveal state each time the show/hide button is pressed. */
  onPasswordVisibleChange?: (visible: boolean) => void;
  /** Leading addon content (the `[dsInputPrefix]` slot) — set `withAddon`. */
  prefix?: React.ReactNode;
  /** Trailing addon content (the `[dsInputSuffix]` slot) — set `withAddonRight`. */
  suffix?: React.ReactNode;
  /** Fires when the native input loses focus. */
  onBlurred?: () => void;
}

/** Single-line text field — port of `ds-input`. Sizes align with select,
 *  dropdown, date-picker and button (sm/md/lg = 32/40/48px). */
export function Input({
  value,
  onValueChange,
  type = 'text',
  size = 'md',
  label = '',
  hint = '',
  placeholder = '',
  disabled = false,
  readOnly = false,
  invalid = false,
  success = false,
  loading = false,
  floating = false,
  withAddon = false,
  withAddonRight = false,
  required = false,
  optional = false,
  name,
  min,
  max,
  step,
  autocomplete,
  autofocus = false,
  ariaLabel,
  maxLength,
  enterKeyHint,
  inputMode,
  clearable,
  passwordToggle = false,
  passwordVisible,
  onPasswordVisibleChange,
  prefix,
  suffix,
  onBlurred,
}: InputProps) {
  const [uid] = React.useState(() => nextControlId('ds-input'));
  const [ownValue, setOwnValue] = React.useState(value ?? '');
  const [ownVisible, setOwnVisible] = React.useState(passwordVisible ?? false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const val = onValueChange ? (value ?? '') : ownValue;
  const setVal = (v: string) => {
    if (!onValueChange) setOwnValue(v);
    onValueChange?.(v);
  };
  const isVisible = onPasswordVisibleChange ? (passwordVisible ?? false) : ownVisible;
  const setVisible = (visible: boolean) => {
    if (!onPasswordVisibleChange) setOwnVisible(visible);
    onPasswordVisibleChange?.(visible);
  };

  const canClear = clearable ?? type === 'search';
  const messageState: FieldMessageState = invalid ? 'error' : success ? 'success' : 'default';
  const resolvedAriaLabel = label ? undefined : ariaLabel || placeholder || undefined;
  const showPasswordToggle = passwordToggle && type === 'password' && !disabled;
  const effectiveType = passwordToggle && type === 'password' && isVisible ? 'text' : type;
  const hintId = hint ? `${uid}-hint` : undefined;

  const wrapperClasses = cx(
    'field',
    size === 'sm' && 'sm',
    size === 'lg' && 'lg',
    invalid ? 'error' : success ? 'success' : false,
    disabled && 'disabled',
    readOnly && 'read-only',
    withAddon && 'with-addon',
    withAddonRight && 'with-addon-right',
    loading && 'loading',
    floating && 'floating',
  );

  return host(
    'ds-input',
    null,
    <div className={wrapperClasses}>
      {label && !floating && (
        <label className="label" htmlFor={uid}>
          {label}
          {required ? (
            <span className="req" aria-hidden="true">*</span>
          ) : optional ? (
            <span className="optional-marker" aria-hidden="true">(optional)</span>
          ) : null}
        </label>
      )}

      <div className="control" onClick={() => inputRef.current?.focus()}>
        {floating && label && (
          <label className="floating-label" htmlFor={uid}>{label}</label>
        )}

        <span className="addon-slot prefix">{prefix}</span>

        <input
          ref={inputRef}
          id={uid}
          type={effectiveType}
          name={name}
          min={min}
          max={max}
          step={step}
          autoComplete={autocomplete}
          autoFocus={autofocus}
          placeholder={placeholder || undefined}
          aria-label={resolvedAriaLabel}
          aria-invalid={invalid ? 'true' : undefined}
          aria-describedby={hintId}
          aria-required={required ? 'true' : undefined}
          enterKeyHint={enterKeyHint}
          inputMode={inputMode}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => onBlurred?.()}
        />

        {canClear && val && !disabled && (
          <button
            type="button"
            className="clear-btn"
            aria-label="Clear input"
            onClick={() => setVal('')}
          />
        )}

        {showPasswordToggle && (
          <button
            type="button"
            className="password-toggle"
            tabIndex={-1}
            aria-label={isVisible ? 'Hide password' : 'Show password'}
            onClick={() => setVisible(!isVisible)}
          >
            <Icon name={isVisible ? 'eye-off' : 'eye'} size={16} />
          </button>
        )}

        {loading && <Spinner size="sm" />}

        <span className="addon-slot suffix">{suffix}</span>
      </div>

      {(hint || messageState !== 'default' || maxLength != null) && (
        <div className="field-footer">
          <FieldMessage text={hint} state={messageState} messageId={hintId} />
          {maxLength != null && (
            <span className="char-counter" aria-live="polite" aria-atomic="true" id={`${uid}-counter`}>
              {val.length}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>,
  );
}
