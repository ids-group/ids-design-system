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
import { DsFieldBase } from './field-base';

/**
 * Value-bearing elements come FIRST, and that ordering is the whole point: the
 * number stepper renders its decrement button before its input, so "the first
 * focusable descendant" would land on minus. `tabindex="-1"` is excluded from
 * both passes so a roving-tabindex group (ds-radio-group) yields the radio that
 * is actually tabbable rather than the first one in the DOM. Portaled panels are
 * outside the host, so a closed picker cannot be focused by accident.
 */
const NOT_ROVED = ':not([tabindex="-1"]):not([disabled])';
const VALUE_ELEMENTS = `input:not([type="hidden"])${NOT_ROVED}, textarea${NOT_ROVED}`;
const TRIGGER_ELEMENTS = `button${NOT_ROVED}, [tabindex="0"]${NOT_ROVED}`;

/**
 * The `ControlValueAccessor` half of a DS value control, with no message API
 * attached. `DsControlValueAccessor` is this plus `DsFieldBase`; a control that
 * holds a value and renders no message row — `ds-search`, a toolbar filter rather
 * than a validated field — takes this directly and gets no message inputs with it.
 *
 * The model arrives as a THUNK, not a signal: on a base class `value` is abstract
 * and on a component it is a field initialiser, so it does not exist yet when this
 * runs. Every read defers to call time, which is also when the effect first runs.
 *
 * Must be called from an injection context (it owns an `effect`).
 * @internal
 */
export function valueControlBridge<T>(model: () => ModelSignal<T>): {
  readonly formDisabled: WritableSignal<boolean>;
  readonly touchedSelf: WritableSignal<boolean>;
  markTouched(): void;
  writeValue(next: T): void;
  registerOnChange(fn: (next: T) => void): void;
  registerOnTouched(fn: () => void): void;
  setDisabledState(isDisabled: boolean): void;
} {
  const formDisabled = signal(false);
  const touchedSelf = signal(false);
  let onChange: (next: T) => void = () => {};
  let onTouched: () => void = () => {};
  // Last value synced with the forms API. Guards the watching effect from echoing
  // a form-driven write back as a user change (which would dirty the control or
  // loop), while still emitting every genuine model change.
  let synced: T | undefined;
  let hasSynced = false;

  effect(() => {
    const next = model()();
    if (!hasSynced) {
      // Adopt the initial value once, silently — never emit on init.
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
    touchedSelf,
    markTouched: () => {
      touchedSelf.set(true);
      onTouched();
    },
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
 * Shared `ControlValueAccessor` for DS form controls whose value is a signal
 * `model()`. Bridges that model with Angular forms (reactive `formControl` /
 * `formControlName` and template `ngModel`) in both directions, WITHOUT
 * touching the existing `[(value)]` signal API — both keep working.
 *
 * A subclass must expose the `value` model and OR `formDisabled()` into its
 * effective disabled state so `FormControl.disable()` actually reaches the
 * control; it should also call `markTouched()` from a blur handler.
 * @internal
 */
@Directive({
  host: { '[style.display]': 'hidden() ? "none" : null' },
})
export abstract class DsControlValueAccessor<T>
  extends DsFieldBase
  implements ControlValueAccessor
{
  /** The component's two-way value model. */
  abstract readonly value: ModelSignal<T>;

  /**
   * Hides the control. On the base so signal forms reaches every control at once.
   * Inline `display`, not the `hidden` attribute — each control sets its own
   * `:host` display, which the attribute's weaker UA rule would lose to.
   */
  readonly hidden = input(false, { transform: booleanAttribute });
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Signal forms calls this through `focusBoundControl()` — typically to reach
   * the first invalid field after a failed submit. Without it the default is to
   * focus the HOST, and a `<ds-*>` element is not focusable, so focus went
   * nowhere. A control with a more precise target overrides this.
   */
  focus(options?: FocusOptions): void {
    focusOwnControl(this.hostElement.nativeElement, options);
  }

  /**
   * The counterpart of `focus()`: drops focus if it sits anywhere inside this
   * control - the input, a picker trigger, the OTP cell that has it - so no
   * subclass overrides it. A portaled panel is outside the host and is left alone.
   * For a host that navigates away after `clear()`, which keeps focus on purpose.
   */
  blur(): void {
    blurOwnControl(this.hostElement.nativeElement);
  }

  private readonly bridge = valueControlBridge<T>(() => this.value);

  /** Driven by the forms API via `setDisabledState`. */
  protected readonly formDisabled = this.bridge.formDisabled;

  // Separate from the control's `touched`, which only exists once `NgControl`
  // resolves — too late to gate the first blur.
  protected readonly touchedSelf = this.bridge.touchedSelf;

  /** Call from a blur handler so the control reports `ng-touched`. */
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
 * Shared `ControlValueAccessor` for DS boolean controls (checkbox, switch)
 * whose state lives in a `checked` model signal rather than `value`. Bridges
 * with Angular forms in both directions without affecting the `[(checked)]`
 * signal API. Subclasses must OR `formDisabled()` into their effective disabled
 * state and call `markTouched()` from a blur handler.
 * @internal
 */
@Directive({
  host: { '[style.display]': 'hidden() ? "none" : null' },
})
export abstract class DsBooleanControlValueAccessor
  extends DsFieldBase
  implements ControlValueAccessor
{
  /** The component's two-way checked model. */
  abstract readonly checked: ModelSignal<boolean>;

  /** Hides the control — see the note on `DsControlValueAccessor.hidden`. */
  readonly hidden = input(false, { transform: booleanAttribute });
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Signal forms calls this through `focusBoundControl()` — typically to reach
   * the first invalid field after a failed submit. Without it the default is to
   * focus the HOST, and a `<ds-*>` element is not focusable, so focus went
   * nowhere. A control with a more precise target overrides this.
   */
  focus(options?: FocusOptions): void {
    focusOwnControl(this.hostElement.nativeElement, options);
  }

  /** The counterpart of `focus()` - see `DsControlValueAccessor.blur`. */
  blur(): void {
    blurOwnControl(this.hostElement.nativeElement);
  }

  /** Driven by the forms API via `setDisabledState`. */
  protected readonly formDisabled = signal(false);

  // Separate from the control's `touched`, which only exists once `NgControl`
  // resolves — too late to gate the first blur.
  protected readonly touchedSelf = signal(false);

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  private synced: boolean | undefined;
  private hasSynced = false;

  constructor() {
    super();
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

  /** Call from a blur handler so the control reports `ng-touched`. */
  protected markTouched(): void {
    this.touchedSelf.set(true);
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
