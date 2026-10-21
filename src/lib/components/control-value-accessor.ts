import {
  Directive,
  ElementRef,
  booleanAttribute,
  effect,
  inject,
  input,
  signal,
  type ModelSignal,
  type WritableSignal,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { DsFormControlBase } from './field-base';

/**
 * Value elements are searched FIRST: the number stepper renders its decrement button before its
 * input. `tabindex="-1"` is excluded so a roving-tabindex group yields the tabbable radio.
 */
const NOT_ROVED = ':not([tabindex="-1"]):not([disabled])';
const VALUE_ELEMENTS = `input:not([type="hidden"])${NOT_ROVED}, textarea${NOT_ROVED}`;
const TRIGGER_ELEMENTS = `button${NOT_ROVED}, [tabindex="0"]${NOT_ROVED}`;

/**
 * The `ControlValueAccessor` half of a DS value control, with no message API (`ds-search`).
 *
 * The model arrives as a THUNK: `value` is abstract on a base class and a field initialiser on
 * a component, so it does not exist yet when this runs.
 *
 * Must be called from an injection context (it owns an `effect`).
 * @internal
 */
export function valueControlBridge<T>(model: () => ModelSignal<T>): {
  readonly formDisabled: WritableSignal<boolean>;
  markTouched(): void;
  writeValue(next: T): void;
  registerOnChange(fn: (next: T) => void): void;
  registerOnTouched(fn: () => void): void;
  setDisabledState(isDisabled: boolean): void;
} {
  const formDisabled = signal(false);
  let onChange: (next: T) => void = () => {};
  let onTouched: () => void = () => {};
  // Stops the effect echoing a form-driven write back as a user change.
  let synced: T | undefined;
  let hasSynced = false;

  effect(() => {
    const next = model()();
    if (!hasSynced) {
      hasSynced = true;
      synced = next;

      return;
    }
    if (Object.is(next, synced)) {
      return;
    }
    synced = next;
    onChange(next);
  });

  return {
    formDisabled,
    markTouched: () => onTouched(),
    writeValue: (next: T) => {
      hasSynced = true;
      synced = next;
      model().set(next);
    },
    registerOnChange: (fn: (next: T) => void) => {
      onChange = fn;
    },
    registerOnTouched: (fn: () => void) => {
      onTouched = fn;
    },
    setDisabledState: (isDisabled: boolean) => {
      formDisabled.set(isDisabled);
    },
  };
}

// Signal forms takes the ControlValueAccessor path for every DS control, and
// focusBoundControl() then calls focus() on the unfocusable HOST.
function delegateHostFocus(
  host: HTMLElement,
  focus: (options?: FocusOptions) => void,
): void {
  host.focus = focus;
}

function focusOwnControl(host: HTMLElement, options?: FocusOptions): void {
  const target =
    host.querySelector<HTMLElement>(VALUE_ELEMENTS) ??
    host.querySelector<HTMLElement>(TRIGGER_ELEMENTS);
  target?.focus(options);
}

function blurOwnControl(host: HTMLElement): void {
  const active = host.ownerDocument.activeElement;
  if (active instanceof HTMLElement && host.contains(active)) {
    active.blur();
  }
}

/**
 * Shared `ControlValueAccessor` for DS form controls whose value is a signal `model()`.
 * A subclass must OR `formDisabled()` into its effective disabled state so
 * `FormControl.disable()` reaches the control, and call `markTouched()` from a blur handler.
 * @internal
 */
@Directive({
  host: { '[style.display]': 'hidden() ? "none" : null' },
})
export abstract class DsControlValueAccessor<T>
  extends DsFormControlBase
  implements ControlValueAccessor
{
  abstract readonly value: ModelSignal<T>;

  /** Hides the control. Inline `display`: the `hidden` attribute loses to each control's `:host` display. */
  readonly hidden = input(false, { transform: booleanAttribute });
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    super();
    delegateHostFocus(this.hostElement.nativeElement, (options) =>
      this.focus(options),
    );
  }

  /** Focuses the control's own input or trigger; `focusBoundControl()` reaches it through the host. */
  focus(options?: FocusOptions): void {
    focusOwnControl(this.hostElement.nativeElement, options);
  }

  /** Drops focus from anywhere inside this control; a portaled panel is left alone. */
  blur(): void {
    blurOwnControl(this.hostElement.nativeElement);
  }

  private readonly bridge = valueControlBridge<T>(() => this.value);

  protected readonly formDisabled = this.bridge.formDisabled;

  protected markTouched(): void {
    this.bridge.markTouched();
  }

  writeValue(value: T): void {
    this.bridge.writeValue(value);
  }

  registerOnChange(fn: (value: T) => void): void {
    this.bridge.registerOnChange(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.bridge.registerOnTouched(fn);
  }

  setDisabledState(isDisabled: boolean): void {
    this.bridge.setDisabledState(isDisabled);
  }
}

/**
 * Shared `ControlValueAccessor` for DS boolean controls (checkbox, switch) whose state lives
 * in a `checked` model. Subclasses must OR `formDisabled()` into their effective disabled
 * state and call `markTouched()` from a blur handler.
 * @internal
 */
@Directive({
  host: { '[style.display]': 'hidden() ? "none" : null' },
})
export abstract class DsBooleanControlValueAccessor
  extends DsFormControlBase
  implements ControlValueAccessor
{
  abstract readonly checked: ModelSignal<boolean>;

  /** Hides the control; see `DsControlValueAccessor.hidden`. */
  readonly hidden = input(false, { transform: booleanAttribute });
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  /** See `DsControlValueAccessor.focus`. */
  focus(options?: FocusOptions): void {
    focusOwnControl(this.hostElement.nativeElement, options);
  }

  /** See `DsControlValueAccessor.blur`. */
  blur(): void {
    blurOwnControl(this.hostElement.nativeElement);
  }

  protected readonly formDisabled = signal(false);

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  private synced: boolean | undefined;
  private hasSynced = false;

  constructor() {
    super();
    delegateHostFocus(this.hostElement.nativeElement, (options) =>
      this.focus(options),
    );
    effect(() => {
      const next = this.checked();
      if (!this.hasSynced) {
        this.hasSynced = true;
        this.synced = next;

        return;
      }
      if (Object.is(next, this.synced)) {
        return;
      }
      this.synced = next;
      this.onChange(next);
    });
  }

  protected markTouched(): void {
    this.onTouched();
  }

  writeValue(value: boolean): void {
    this.hasSynced = true;
    this.synced = value;
    this.checked.set(value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
