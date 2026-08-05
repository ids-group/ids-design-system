import { Directive, effect, signal, type ModelSignal } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';

/**
 * Shared `ControlValueAccessor` for DS form controls whose value is a signal
 * `model()`. Bridges that model with Angular forms (reactive `formControl` /
 * `formControlName` and template `ngModel`) in both directions, WITHOUT
 * touching the existing `[(value)]` signal API — both keep working.
 *
 * A subclass must expose the `value` model and OR `formDisabled()` into its
 * effective disabled state so `FormControl.disable()` actually reaches the
 * control; it should also call `markTouched()` from a blur handler.
 */
@Directive()
export abstract class DsControlValueAccessor<
  T,
> implements ControlValueAccessor {
  /** The component's two-way value model. */
  abstract readonly value: ModelSignal<T>;

  /** Driven by the forms API via `setDisabledState`. */
  protected readonly formDisabled = signal(false);

  // Separate from the control's `touched`, which only exists once `NgControl`
  // resolves — too late to gate the first blur.
  protected readonly touchedSelf = signal(false);

  private onChange: (value: T) => void = () => {};
  private onTouched: () => void = () => {};

  // Last value synced with the forms API. Guards the value-watching effect from
  // echoing a form-driven write back as a user change (which would dirty the
  // control or loop), while still emitting every genuine model change.
  private synced: T | undefined;
  private hasSynced = false;

  constructor() {
    effect(() => {
      const next = this.value();
      if (!this.hasSynced) {
        // Adopt the initial value once, silently — never emit on init.
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

  writeValue(value: T): void {
    this.hasSynced = true;
    this.synced = value;
    this.value.set(value);
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}

/**
 * Shared `ControlValueAccessor` for DS boolean controls (checkbox, switch)
 * whose state lives in a `checked` model signal rather than `value`. Bridges
 * with Angular forms in both directions without affecting the `[(checked)]`
 * signal API. Subclasses must OR `formDisabled()` into their effective disabled
 * state and call `markTouched()` from a blur handler.
 */
@Directive()
export abstract class DsBooleanControlValueAccessor implements ControlValueAccessor {
  /** The component's two-way checked model. */
  abstract readonly checked: ModelSignal<boolean>;

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
