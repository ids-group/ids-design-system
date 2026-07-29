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
import { SpinnerComponent } from '../spinner/spinner.component';
import { DsControlValueAccessor } from '../control-value-accessor';
import {
  FieldMessageComponent,
  type FieldMessageState,
} from '../field-message/field-message.component';
import { nextControlId } from '../field-ids';
import { FieldClickFocusDirective } from '../field-click-focus.directive';
import type { InputType } from './input.types';
import type { DsSize } from '../../core/size';

@Component({
  selector: 'ds-input',
  standalone: true,
  imports: [
    FormsModule,
    IconComponent,
    SpinnerComponent,
    FieldMessageComponent,
    FieldClickFocusDirective,
  ],
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
  /** Text value, two-way bound. */
  readonly value = model<string>('');
  /** Native input type — also affects the default clear button and password toggle. */
  readonly type = input<InputType>('text');
  /** Field height — sm/md/lg. */
  readonly size = input<DsSize>('md');
  /** Label shown above the field, or inside it when `floating`. */
  readonly label = input<string>('');
  /** Helper text shown below the field. */
  readonly hint = input<string>('');
  /** Reserve the message-row height even when empty, so the field doesn't shift
   *  the layout below it when a hint/error appears. Default on — opt out for a
   *  deliberately collapsing field. */
  readonly reserveMessage = input(true, { transform: booleanAttribute });
  /** Placeholder shown when empty. */
  readonly placeholder = input<string>('');
  /** Disables the field and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Prevents editing while still allowing focus and selection. */
  readonly readOnly = input(false, { transform: booleanAttribute });
  /** Applies error styling and marks the field `aria-invalid`. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Applies success styling to the field. */
  readonly success = input(false, { transform: booleanAttribute });
  /** Shows a trailing spinner — e.g. async validation in flight. The input
   *  stays editable; pair with a `hint` like "Checking availability…". */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Floating-label variant — the label sits inside a taller control instead
   *  of stacked above it. */
  readonly floating = input(false, { transform: booleanAttribute });
  /** Reserves space for a leading addon projected into `[dsInputPrefix]`. */
  readonly withAddon = input(false, { transform: booleanAttribute });
  /** Reserves space for a trailing addon projected into `[dsInputSuffix]`. */
  readonly withAddonRight = input(false, { transform: booleanAttribute });
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Shows an "(optional)" marker next to the label (ignored when `required`). */
  readonly optional = input(false, { transform: booleanAttribute });
  /** Native `name` attribute. */
  readonly name = input<string | null>(null);
  // Numeric constraints (applied when type="number").
  /** Native `min` attribute — applies when `type="number"`. */
  readonly min = input<number | null>(null);
  /** Native `max` attribute — applies when `type="number"`. */
  readonly max = input<number | null>(null);
  /** Native `step` attribute — applies when `type="number"`. */
  readonly step = input<number | null>(null);
  /** Native autocomplete token (e.g. "email", "current-password"). */
  readonly autocomplete = input<string | null>(null);
  /** Focuses the field automatically on render. */
  readonly autofocus = input(false, { transform: booleanAttribute });
  /** Accessible name when no visible `label` is provided (falls back to the
   *  placeholder so the control is never unnamed). */
  readonly ariaLabel = input<string | null>(null);
  /** Hard character cap — applies the native maxlength attribute and shows a
   *  live "{current}/{max}" counter below the field. */
  readonly maxLength = input<number | null>(null);
  /** Mobile keyboard hints — forwarded to the native input as attributes. */
  readonly enterKeyHint = input<
    'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send' | null
  >(null);
  /** Native `inputmode` attribute — hints the on-screen keyboard layout. */
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

  /** Shows a show/hide button when `type="password"`. */
  readonly passwordToggle = input(false, { transform: booleanAttribute });
  /** Whether the password is currently shown as plain text, two-way bound. */
  readonly passwordVisible = model<boolean>(false);

  protected readonly canClear = computed<boolean>(() => {
    const explicit = this.clearable();
    if (explicit !== null) {
      return explicit;
    }

    return this.type() === 'search';
  });

  protected readonly uid = nextControlId('ds-input');
  protected readonly hintId = computed(() =>
    this.hint() ? `${this.uid}-hint` : null,
  );
  protected readonly messageState = computed<FieldMessageState>(() =>
    this.invalid() ? 'error' : this.success() ? 'success' : 'default',
  );
  /** Only name via aria-label when there's no visible `<label for>`. */
  protected readonly resolvedAriaLabel = computed(() =>
    this.label() ? null : this.ariaLabel() || this.placeholder() || null,
  );

  /** Effective disabled — own `disabled` input OR the reactive-forms state. */
  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  protected readonly currentLength = computed(() => this.value().length);
  protected readonly counterId = computed(() =>
    this.maxLength() !== null ? `${this.uid}-counter` : null,
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
    if (this.loading()) {
      parts.push('loading');
    }
    if (this.floating()) {
      parts.push('floating');
    }

    return parts.join(' ');
  });

  protected clear(): void {
    this.value.set('');
  }
}
