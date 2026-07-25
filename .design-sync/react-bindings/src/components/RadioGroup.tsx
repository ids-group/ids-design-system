import * as React from 'react';
import { host, nextControlId } from '../lib/util';
import { FieldMessage, type FieldMessageState } from '../lib/FieldMessage';

/** Radio option value. The Angular component uses `unknown`; string | number
 *  covers real usage and keeps the callback typing usable. */
export type RadioValue = string | number;

/** Registration a projected Radio makes with its parent group — used for
 *  arrow-key navigation and focus-follows-selection (the React stand-in for
 *  Angular's `contentChildren(RadioComponent)`). */
export interface RadioGroupEntry {
  value: RadioValue;
  disabled: boolean;
  input: HTMLInputElement | null;
}

export interface RadioGroupContextValue {
  /** Currently selected value (null = nothing selected). */
  value: RadioValue | null;
  /** Native `name` shared by every radio in the group. */
  name: string;
  /** Whole-group disabled state. */
  disabled: boolean;
  select: (value: RadioValue) => void;
  register: (entry: RadioGroupEntry) => () => void;
}

/** React stand-in for the Angular `RADIO_GROUP` injection token. Consumed by
 *  `Radio` to derive checked/name/disabled from the enclosing group. */
export const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
  /** Selected radio value. Controlled when `onValueChange` is provided;
   *  otherwise the component manages its own state seeded from this value. */
  value?: RadioValue | null;
  /** Emits the newly selected value. */
  onValueChange?: (value: RadioValue) => void;
  /** Native `name` shared by every radio in the group. Defaults to a generated id. */
  name?: string;
  /** Disables the whole group. */
  disabled?: boolean;
  /** Applies error styling and marks the group `aria-invalid`. */
  invalid?: boolean;
  /** Helper text shown below the group. */
  hint?: string;
  /** Accessible name for the group when no visible label is provided. */
  ariaLabel?: string;
  /** Visible group label; omit to supply your own. */
  label?: string;
  /** The `Radio` options (plus any layout wrappers). */
  children?: React.ReactNode;
}

/** Radio group — port of `ds-radio-group`. Wires projected `Radio` children
 *  via context: shared name, group disabled state, single selection and
 *  arrow-key navigation between enabled options. */
export function RadioGroup({
  value,
  onValueChange,
  name,
  disabled = false,
  invalid = false,
  hint = '',
  ariaLabel,
  label = '',
  children,
}: RadioGroupProps) {
  const [uid] = React.useState(() => nextControlId('ds-radio-group'));
  const [ownValue, setOwnValue] = React.useState<RadioValue | null>(value ?? null);
  const entriesRef = React.useRef<RadioGroupEntry[]>([]);

  const val = onValueChange ? (value ?? null) : ownValue;
  const groupName = name ?? uid;
  const hintId = hint ? `${uid}-hint` : undefined;
  const messageState: FieldMessageState = invalid ? 'error' : 'default';

  const select = (v: RadioValue) => {
    if (!onValueChange) setOwnValue(v);
    onValueChange?.(v);
    // Focus the newly selected radio so keyboard users stay on track.
    entriesRef.current.find((e) => e.value === v)?.input?.focus();
  };

  const register = React.useCallback((entry: RadioGroupEntry) => {
    entriesRef.current.push(entry);
    return () => {
      const i = entriesRef.current.indexOf(entry);
      if (i !== -1) entriesRef.current.splice(i, 1);
    };
  }, []);

  const onKeydown = (event: React.KeyboardEvent) => {
    const key = event.key;
    if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', ' ', 'Enter'].includes(key)) {
      return;
    }
    const entries = entriesRef.current;
    const enabled = disabled ? [] : entries.filter((e) => !e.disabled);
    if (!enabled.length) return;

    event.preventDefault();

    if (key === ' ' || key === 'Enter') {
      // Select whichever radio currently has DOM focus.
      const focused = enabled.find((e) => e.input === document.activeElement);
      if (focused) select(focused.value);
      return;
    }

    const forward = key === 'ArrowDown' || key === 'ArrowRight';
    let currentIndex = enabled.findIndex((e) => e.input === document.activeElement);
    if (currentIndex === -1) {
      currentIndex = enabled.findIndex((e) => e.value === val);
    }
    const nextIndex =
      currentIndex === -1
        ? forward
          ? 0
          : enabled.length - 1
        : forward
          ? (currentIndex + 1) % enabled.length
          : (currentIndex - 1 + enabled.length) % enabled.length;
    select(enabled[nextIndex].value);
  };

  const context: RadioGroupContextValue = {
    value: val,
    name: groupName,
    disabled,
    select,
    register,
  };

  return host(
    'ds-radio-group',
    {
      role: 'radiogroup',
      'aria-label': ariaLabel || label || undefined,
      'aria-describedby': hintId,
      'aria-invalid': invalid ? 'true' : undefined,
    },
    <RadioGroupContext.Provider value={context}>
      {label && <span className="group-label">{label}</span>}
      <div className="radios" onKeyDown={onKeydown}>
        {children}
      </div>
      <FieldMessage text={hint} state={messageState} messageId={hintId} />
    </RadioGroupContext.Provider>,
  );
}
