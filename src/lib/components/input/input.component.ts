import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  output,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../../icons/icon.component';
import { DsControlValueAccessor } from '../control-value-accessor';
import type { InputSize, InputType } from './input.types';

/** Process-wide counter so each control gets a stable, unique id for
 *  label/hint association (no DOM dependency, SSR-safe). */
let nextId = 0;

@Component({
  selector: 'ds-input',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent extends DsControlValueAccessor<string> {
  readonly value = model<string>('');
  readonly type = input<InputType>('text');
  readonly size = input<InputSize>('md');
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly readOnly = input(false, { transform: booleanAttribute });
  readonly invalid = input<boolean>(false);
  readonly success = input(false, { transform: booleanAttribute });
  readonly withAddon = input(false, { transform: booleanAttribute });
  readonly withAddonRight = input(false, { transform: booleanAttribute });
  readonly required = input<boolean>(false);
  readonly optional = input<boolean>(false);
  readonly name = input<string | null>(null);
  // Numeric constraints (applied when type="number").
  readonly min = input<number | null>(null);
  readonly max = input<number | null>(null);
  readonly step = input<number | null>(null);
  /** Native autocomplete token (e.g. "email", "current-password"). */
  readonly autocomplete = input<string | null>(null);
  readonly autofocus = input<boolean>(false);
  /** Accessible name when no visible `label` is provided (falls back to the
   *  placeholder so the control is never unnamed). */
  readonly ariaLabel = input<string | null>(null);
  /** Mobile keyboard hints — forwarded to the native input as attributes. */
  readonly enterKeyHint = input<
    'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send' | null
  >(null);
  readonly inputMode = input<
    | 'none'
    | 'text'
    | 'decimal'
    | 'numeric'
    | 'tel'
    | 'search'
    | 'email'
    | 'url'
    | null
  >(null);
  /** Emits when the native input loses focus. */
  readonly blurred = output<void>();
  /**
   * Show an inline clear (×) button when the input has a non-empty value.
   * Mirrors the Material/PrimeNG pattern: explicit button (not native search
   * cancel) so the affordance is consistent across browsers and styled with
   * DS tokens. Defaults to true when type='search', false otherwise — pass
   * an explicit boolean to override.
   */
  readonly clearable = input<boolean | null>(null);

  readonly passwordToggle = input(false, { transform: booleanAttribute });
  readonly passwordVisible = model<boolean>(false);

  protected readonly canClear = computed<boolean>(() => {
    const explicit = this.clearable();
    if (explicit !== null) {
      return explicit;
    }

    return this.type() === 'search';
  });

  protected readonly uid = `ds-input-${++nextId}`;
  protected readonly hintId = computed(() =>
    this.hint() ? `${this.uid}-hint` : null,
  );
  /** Only name via aria-label when there's no visible `<label for>`. */
  protected readonly resolvedAriaLabel = computed(() =>
    this.label() ? null : this.ariaLabel() || this.placeholder() || null,
  );

  /** Effective disabled — own `disabled` input OR the reactive-forms state. */
  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  protected readonly showPasswordToggle = computed<boolean>(
    () =>
      this.passwordToggle() && this.type() === 'password' && !this.isDisabled(),
  );

  protected readonly effectiveType = computed<InputType>(() =>
    this.passwordToggle() &&
    this.type() === 'password' &&
    this.passwordVisible()
      ? 'text'
      : this.type(),
  );

  protected togglePassword(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected readonly wrapperClasses = computed(() => {
    const parts = ['field'];
    if (this.size() === 'sm') {
      parts.push('sm');
    }
    if (this.size() === 'lg') {
      parts.push('lg');
    }
    if (this.invalid()) {
      parts.push('error');
    } else if (this.success()) {
      parts.push('success');
    }
    if (this.isDisabled()) {
      parts.push('disabled');
    }
    if (this.readOnly()) {
      parts.push('read-only');
    }
    if (this.withAddon()) {
      parts.push('with-addon');
    }
    if (this.withAddonRight()) {
      parts.push('with-addon-right');
    }

    return parts.join(' ');
  });

  protected clear(): void {
    this.value.set('');
  }
}
