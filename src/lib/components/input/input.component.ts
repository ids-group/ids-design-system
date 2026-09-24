import {
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { DS_INTL, optionalBound } from '@ids-group-ltd/ids-design-system/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { SpinnerComponent } from '@ids-group-ltd/ids-design-system/components/spinner';
import { DsControlValueAccessor } from '@ids-group-ltd/ids-design-system/components';
import { FieldMessageComponent } from '@ids-group-ltd/ids-design-system/components/field-message';
import {
  resolveFieldMessage,
  trimmedText,
} from '@ids-group-ltd/ids-design-system/components';
import { nextControlId } from '@ids-group-ltd/ids-design-system/components';
import { FieldClickFocusDirective } from '@ids-group-ltd/ids-design-system/components';
import type { InputType } from './input.types';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';
import {
  describedByIds,
  groupInvalid,
  groupMessageId,
  inFieldGroup,
} from '@ids-group-ltd/ids-design-system/components/field-group';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';

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
  host: {
    '[attr.data-field-state]': 'controlState()',
    '[class.in-group]': 'inGroup',
  },
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
  protected readonly intl = inject(DS_INTL);
  private readonly control = viewChild<ElementRef<HTMLInputElement>>('control');
  /** Segment of a ds-field-group: the group owns the border, radius and focus
   *  ring, so .in-group strips this control back to its bare contents. */
  protected readonly inGroup = inFieldGroup();

  /** Text value, two-way bound. */
  readonly value = model<string>('');
  /** Native input type — also affects the default clear button and password toggle. */
  readonly type = input<InputType>('text');
  /** Field height — sm/md/lg.
   *  Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** Label shown above the field. */
  readonly label = input<string>('');
  /** Placeholder shown when empty. */
  readonly placeholder = input<string>('');
  /** Disables the field and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Prevents editing while still allowing focus and selection. */
  readonly readOnly = input(false, { transform: booleanAttribute });
  /**
   * The contract spelling of `readOnly`: signal forms binds by NAME, so a
   * `readonly()` rule reaches nothing without it.
   */
  readonly readonlyBinding = input(false, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: 'readonly',
    transform: booleanAttribute,
  });
  protected readonly isReadOnly = computed(
    () => this.readOnly() || this.readonlyBinding(),
  );
  /** Confirmation text, shown when there is no error or warning — and it paints
   *  the field's success border. A string like `warning`: the text IS the state. */
  readonly success = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** Shows a trailing spinner — e.g. async validation in flight. The input
   *  stays editable; pair with a `hint` like "Checking availability…". */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Shows an "(optional)" marker next to the label (ignored when `required`). */
  readonly optional = input(false, { transform: booleanAttribute });
  /** Native `name` attribute. */
  readonly name = input<string | null>(null);
  /** Native `min` attribute — applies when `type="number"`. */
  readonly min = input<number | null, number | null | undefined>(null, {
    transform: optionalBound,
  });
  /** Native `max` attribute — applies when `type="number"`. */
  readonly max = input<number | null, number | null | undefined>(null, {
    transform: optionalBound,
  });
  /** Native `step` attribute — applies when `type="number"`. */
  readonly step = input<number | null>(null);
  /** Native autocomplete token (e.g. "email", "current-password"). */
  readonly autocomplete = input<string | null>(null);
  /** Focuses the field automatically on render. */
  readonly autofocus = input(false, { transform: booleanAttribute });
  /** Accessible name when no visible `label` is provided (falls back to the
   *  placeholder so the control is never unnamed). */
  readonly ariaLabel = input<string | null>(null);
  /** Extra element ids to describe the control with — a password-rule list, a
   *  policy note. MERGED with the field's own message id rather than replacing
   *  it, and it has to be an input because the attribute belongs on the inner
   *  `<input>`: set on the host it lands on a wrapper no screen reader reads. */
  readonly ariaDescribedBy = input<string | null>(null);
  /** Hard character cap — applies the native maxlength attribute and shows a
   *  live "{current}/{max}" counter below the field. */
  readonly maxLength = input<number | null, number | null | undefined>(null, {
    transform: optionalBound,
  });
  // Signal forms binds these by name; without them a `pattern()` or `minLength()`
  // rule validates in the form model while the native element advertises nothing.
  /** Native `minlength` attribute. */
  readonly minLength = input<number | null, number | null | undefined>(null, {
    transform: optionalBound,
  });
  /** Native `pattern` attribute — signal forms sends the schema's RegExp list. */
  readonly pattern = input<
    readonly RegExp[],
    readonly RegExp[] | string | undefined
  >([], {
    transform: (value) =>
      value === undefined
        ? []
        : typeof value === 'string'
          ? [new RegExp(value)]
          : value,
  });
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
   * Defaults to true when `type="search"`, false otherwise — pass an explicit
   * boolean to override.
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

  /** A native `pattern` takes ONE expression; the schema can carry several, so
   *  they are ANDed with lookaheads rather than silently dropping all but one. */
  protected readonly patternAttribute = computed(() => {
    const expressions = this.pattern();
    if (!expressions.length) {
      return null;
    }

    return (
      expressions.map((expression) => `(?=${expression.source})`).join('') +
      '.*'
    );
  });
  protected readonly uid = nextControlId('ds-input');
  protected readonly hintId = computed(() =>
    this.message().text ? `${this.uid}-hint` : null,
  );
  protected readonly describedBy = computed(() => {
    return describedByIds(
      this.hintId(),
      this.groupMessage(),
      this.ariaDescribedBy(),
    );
  });
  private readonly fieldMessage = resolveFieldMessage({
    disabled: () => this.isDisabled(),
    hint: this.hint,
    warning: this.warning,
    error: this.error,
    errors: this.errors,
    invalid: this.invalid,
    success: this.success,
    touchedSelf: this.touchedSelf,
    touched: this.touched,
  });
  protected readonly message = this.fieldMessage.message;
  protected readonly controlState = this.fieldMessage.controlState;
  protected readonly groupMessage = groupMessageId();
  protected readonly invalidResolved = groupInvalid(this.fieldMessage.invalid);
  /** Only name via aria-label when there's no visible `<label for>`. */
  protected readonly resolvedAriaLabel = computed(() =>
    this.label() ? null : this.ariaLabel() || this.placeholder() || null,
  );

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
    if (this.sizeResolved() === 'sm') {
      parts.push('sm');
    }
    if (this.sizeResolved() === 'lg') {
      parts.push('lg');
    }
    if (this.invalidResolved()) {
      parts.push('error');
    } else if (this.success().trim()) {
      parts.push('success');
    }
    if (this.isDisabled()) {
      parts.push('disabled');
    }
    if (this.isReadOnly()) {
      parts.push('read-only');
    }
    if (this.loading()) {
      parts.push('loading');
    }

    return parts.join(' ');
  });

  /** Move keyboard focus to the native input — public so a host can drive it
   *  deliberately, e.g. focusing the first invalid field on a failed submit. */
  override focus(options?: FocusOptions): void {
    this.control()?.nativeElement.focus(options);
  }

  protected clear(): void {
    this.value.set('');
  }
}
