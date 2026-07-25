import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';
import { FieldMessage, type FieldMessageState } from '../lib/FieldMessage';

export type OtpMode = 'numeric' | 'alphanumeric';

export interface OtpInputProps {
  /** Entered code. Controlled when `onValueChange` is provided; otherwise the
   *  component manages its own state seeded from this value. */
  value?: string;
  /** Emits the new code on every cell edit, paste or delete. */
  onValueChange?: (value: string) => void;
  /** Number of character cells. */
  length?: number;
  /** Restricts input and the mobile keyboard to digits-only, or allows letters too. */
  mode?: OtpMode;
  /** Renders each cell as a password dot instead of the typed character. */
  mask?: boolean;
  /** Disables all cells and blocks interaction. */
  disabled?: boolean;
  /** Applies error styling and marks each cell `aria-invalid`. */
  invalid?: boolean;
  /** Helper text shown below the cells. */
  hint?: string;
  /** Accessible group label for the cell row. */
  ariaLabel?: string;
  /** Fires once, with the full code, on the partial → complete transition. */
  onCompleted?: (value: string) => void;
}

/** One-time-code entry as N single-character cells — port of `ds-otp-input`.
 *  Typing advances, Backspace on an empty cell steps back, paste distributes
 *  across cells, and focus is redirected to the first empty cell so the code
 *  stays left-packed. */
export function OtpInput({
  value,
  onValueChange,
  length = 6,
  mode = 'numeric',
  mask = false,
  disabled = false,
  invalid = false,
  hint = '',
  ariaLabel = 'Verification code',
  onCompleted,
}: OtpInputProps) {
  const [uid] = React.useState(() => nextControlId('ds-otp-input'));
  const hintId = hint ? `${uid}-hint` : undefined;
  const messageState: FieldMessageState = invalid ? 'error' : 'default';

  const [ownValue, setOwnValue] = React.useState(value ?? '');
  const val = onValueChange ? (value ?? '') : ownValue;
  const setVal = (v: string) => {
    if (!onValueChange) setOwnValue(v);
    onValueChange?.(v);
  };

  const boxes = React.useRef<Array<HTMLInputElement | null>>([]);
  const wasComplete = React.useRef(val.length === length);

  // Fixed-length, position-preserving view of the current value.
  const sliced = val.slice(0, length);
  const cells = Array.from({ length }, (_, i) => sliced[i] ?? '');

  const sanitize = (raw: string): string => {
    const pattern = mode === 'numeric' ? /[^0-9]/g : /[^0-9a-zA-Z]/g;
    return raw.replace(pattern, '');
  };

  const focusBox = (index: number) => {
    const box = boxes.current[index];
    if (box) {
      box.focus();
      box.select();
    }
  };

  const commit = (nextCells: string[]) => {
    const nextValue = nextCells.join('').slice(0, length);
    setVal(nextValue);
    // Fire `onCompleted` only on the partial → full transition, not on every
    // edit of an already-complete code (which would re-trigger consumers).
    const complete = nextValue.length === length;
    if (complete && !wasComplete.current) {
      onCompleted?.(nextValue);
    }
    wasComplete.current = complete;
  };

  const writeCell = (index: number, char: string) => {
    if (index < 0 || index >= length) return;
    const next = cells.slice();
    next[index] = char;
    commit(next);
  };

  const distribute = (text: string, startIndex: number) => {
    const next = cells.slice();
    let cursor = startIndex;
    for (const char of text) {
      if (cursor >= length) break;
      next[cursor] = char;
      cursor++;
    }
    commit(next);
    focusBox(Math.min(cursor, length - 1));
  };

  const onInput = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const element = event.target;
    const cleaned = sanitize(element.value);
    if (!cleaned) {
      writeCell(index, '');
      element.value = '';
      return;
    }
    if (cleaned.length === 1) {
      writeCell(index, cleaned);
      element.value = cleaned;
      focusBox(index + 1);
    } else {
      distribute(cleaned, index);
    }
  };

  const onKeydown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    switch (event.key) {
      case 'Backspace':
        if (!cells[index]) {
          event.preventDefault();
          writeCell(index - 1, '');
          focusBox(index - 1);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        focusBox(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        focusBox(index + 1);
        break;
      default:
        break;
    }
  };

  const onPaste = (event: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    const text = event.clipboardData?.getData('text') ?? '';
    const cleaned = sanitize(text);
    if (!cleaned) return;
    event.preventDefault();
    distribute(cleaned, index);
  };

  const onFocus = (event: React.FocusEvent<HTMLInputElement>, index: number) => {
    event.target.select();
    // Keep entry left-packed: redirect focus to the first empty cell so the
    // user can't type into a gap (the flat value can't represent middle gaps).
    const firstEmpty = cells.findIndex((cell) => cell === '');
    if (firstEmpty >= 0 && index > firstEmpty) {
      focusBox(firstEmpty);
    }
  };

  const cellLabel = (index: number): string => {
    const noun = mode === 'numeric' ? 'Digit' : 'Character';
    return `${noun} ${index + 1}`;
  };

  return host(
    'ds-otp-input',
    {
      role: 'group',
      'aria-label': ariaLabel,
      class: cx(invalid && 'invalid') || undefined,
      'aria-describedby': hintId,
    },
    <div className="cells">
      {cells.map((cell, i) => (
        <input
          key={i}
          ref={(el) => {
            boxes.current[i] = el;
          }}
          className="cell"
          type={mask ? 'password' : 'text'}
          inputMode={mode === 'numeric' ? 'numeric' : 'text'}
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={cellLabel(i)}
          aria-invalid={invalid ? 'true' : undefined}
          value={cell}
          disabled={disabled}
          onChange={(e) => onInput(e, i)}
          onKeyDown={(e) => onKeydown(e, i)}
          onPaste={(e) => onPaste(e, i)}
          onFocus={(e) => onFocus(e, i)}
        />
      ))}
    </div>,
    <FieldMessage text={hint} state={messageState} messageId={hintId} />,
  );
}
