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
