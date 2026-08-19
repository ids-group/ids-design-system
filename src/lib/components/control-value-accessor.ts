import {
  Directive,
  ElementRef,
  booleanAttribute,
  effect,
  inject,
  input,
  signal,
  type ModelSignal,
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

function focusOwnControl(host: HTMLElement, options?: FocusOptions): void {
  const target =
    host.querySelector<HTMLElement>(VALUE_ELEMENTS) ??
    host.querySelector<HTMLElement>(TRIGGER_ELEMENTS);
  target?.focus(options);
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
    super();
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
