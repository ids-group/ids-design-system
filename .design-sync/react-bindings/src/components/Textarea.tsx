import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';
import { FieldMessage, type FieldMessageState } from '../lib/FieldMessage';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export interface TextareaProps {
  /** Text value. Controlled when `onValueChange` is provided; otherwise the
   *  component manages its own state seeded from this value. */
  value?: string;
  /** Emits the new value on every keystroke. */
  onValueChange?: (value: string) => void;
  /** Field height — sm/md/lg. Default 'md'. */
  size?: TextareaSize;
  /** Label shown above the field. */
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
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Shows an "(optional)" marker next to the label (ignored when `required`). */
  optional?: boolean;
  /** Native `rows` attribute — visible line count. Default 3. */
  rows?: number;
  /** Native `name` attribute. */
  name?: string;
  /** Grows the field with content instead of scrolling; forces `resize` to none.
   *  (Relies on CSS `field-sizing: content` shipped in the DS stylesheet.) */
  autosize?: boolean;
  /** Minimum height in lines when `autosize`. */
  minRows?: number;
  /** Maximum height in lines when `autosize`, beyond which it scrolls. */
  maxRows?: number;
  /** Native CSS `resize` behaviour — ignored when `autosize`. Default 'vertical'. */
  resize?: TextareaResize;
  /** Accessible name when no visible `label` is provided. */
  ariaLabel?: string;
  /** Hard character cap — applies the native maxlength attribute and shows a
   *  live "{current}/{max}" counter below the field. */
  maxLength?: number;
}

/** Multi-line text field — port of `ds-textarea`. Same label/hint/validation
 *  anatomy as Input; grows with content when `autosize` is set. */
export function Textarea({
  value,
  onValueChange,
  size = 'md',
  label = '',
  hint = '',
  placeholder = '',
  disabled = false,
  readOnly = false,
  invalid = false,
  required = false,
  optional = false,
  rows = 3,
  name,
  autosize = false,
  minRows,
  maxRows,
  resize = 'vertical',
  ariaLabel,
  maxLength,
}: TextareaProps) {
  const [uid] = React.useState(() => nextControlId('ds-textarea'));
  const [ownValue, setOwnValue] = React.useState(value ?? '');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const val = onValueChange ? (value ?? '') : ownValue;
  const setVal = (v: string) => {
    if (!onValueChange) setOwnValue(v);
    onValueChange?.(v);
  };

  const hintId = hint ? `${uid}-hint` : undefined;
  const messageState: FieldMessageState = invalid ? 'error' : 'default';
  const resolvedAriaLabel = label ? undefined : ariaLabel || placeholder || undefined;

  const wrapperClasses = cx(
    'field',
    size === 'sm' && 'sm',
    size === 'lg' && 'lg',
    invalid && 'error',
    disabled && 'disabled',
    readOnly && 'read-only',
    autosize && 'autosize',
  );

  // Autosize grows with content, so a manual resize handle conflicts — force none.
  const effectiveResize: TextareaResize = autosize ? 'none' : resize;

  return host(
    'ds-textarea',
    null,
    <div className={wrapperClasses}>
      {label && (
        <label className="label" htmlFor={uid}>
          {label}
          {required ? (
            <span className="req" aria-hidden="true">*</span>
          ) : optional ? (
            <span className="optional-marker" aria-hidden="true">(optional)</span>
          ) : null}
        </label>
      )}

      <div className="control" onClick={() => textareaRef.current?.focus()}>
        <textarea
          ref={textareaRef}
          id={uid}
          rows={rows}
          name={name}
          placeholder={placeholder || undefined}
          aria-label={resolvedAriaLabel}
          aria-invalid={invalid ? 'true' : undefined}
          aria-describedby={hintId}
          aria-required={required ? 'true' : undefined}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          style={{
            resize: effectiveResize,
            minHeight: autosize && minRows ? `${minRows}lh` : undefined,
            maxHeight: autosize && maxRows ? `${maxRows}lh` : undefined,
            overflowY: autosize && maxRows ? 'auto' : undefined,
          }}
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
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
