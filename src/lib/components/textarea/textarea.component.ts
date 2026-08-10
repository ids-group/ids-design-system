import {
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  viewChild,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DsControlValueAccessor } from '../control-value-accessor';
import type { TextareaResize } from './textarea.types';
import type { DsSize } from '../../core/size';
import { FieldMessageComponent } from '../field-message/field-message.component';
import {
  normalizeFieldErrors,
  resolveFieldMessage,
  type DsFieldError,
  type DsFieldErrorsInput,
} from '../field-errors';
import { nextControlId } from '../field-ids';
import { FieldClickFocusDirective } from '../field-click-focus.directive';
import { resolveReserveMessage } from '../field-defaults';

@Component({
  selector: 'ds-textarea',
  standalone: true,
  imports: [FormsModule, FieldMessageComponent, FieldClickFocusDirective],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
})
export class TextareaComponent extends DsControlValueAccessor<string> {
  private readonly control =
    viewChild<ElementRef<HTMLTextAreaElement>>('control');

  /** Text value, two-way bound. */
  readonly value = model<string>('');
  /** Field height — sm/md/lg. */
  readonly size = input<DsSize>('md');
  /** Label shown above the field. */
  readonly label = input<string>('');
  /** Helper text shown below the field. */
  readonly hint = input<string>('');
  /** Error text. Shown immediately — binding it says the consumer has already
   *  decided this field is in error. Takes precedence over `errors`. */
  readonly error = input<string>('');
  /** Advisory text, shown when there is no error. */
  readonly warning = input<string>('');
  /** Validation errors, shown once the user has interacted. Bound automatically
   *  by signal forms; reactive and template-driven forms are read through
   *  `NgControl` and need nothing here. Accepts a string, one error, or an array. */
  readonly errors = input<readonly DsFieldError[], DsFieldErrorsInput>([], {
    transform: normalizeFieldErrors,
  });
  /** Whether the user has interacted with the field. Bound by signal forms; gates
   *  `errors`, so a `required` error does not greet an untouched form. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** Reserve the message-row height even when empty, so the field doesn't shift
   *  the layout below it when a hint/error appears. Falls back to
   *  `DS_CONFIG.field.reserveMessage`, then off — opt in per field, or app-wide
   *  for a form that shows validation messages. */
  readonly reserveMessage = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });
  protected readonly reserveMessageResolved = resolveReserveMessage(
    this.reserveMessage,
  );
  /** Placeholder shown when empty. */
  readonly placeholder = input<string>('');
  /** Disables the field and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Prevents editing while still allowing focus and selection. */
  readonly readOnly = input(false, { transform: booleanAttribute });
  /**
   * The contract spelling of `readOnly`, kept as a separate input because signal
   * forms binds by NAME: a `readonly()` rule was reaching nothing before this.
   * Either name sets it; `isReadOnly` resolves both.
   */
  readonly readonlyBinding = input(false, {
    // The alias IS the point: signal forms binds by name, and the contract
    // spells it `readonly` where the DS spells it `readOnly`.
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: 'readonly',
    transform: booleanAttribute,
  });
  protected readonly isReadOnly = computed(
    () => this.readOnly() || this.readonlyBinding(),
  );
  /** Applies error styling and marks the field `aria-invalid`. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Shows an "(optional)" marker next to the label (ignored when `required`). */
  readonly optional = input(false, { transform: booleanAttribute });
  /** Native `rows` attribute — visible line count. */
  readonly rows = input<number>(3);
  /** Native `name` attribute. */
  readonly name = input<string | null>(null);
  /** Grows the field with content instead of scrolling; forces `resize` to none. */
  readonly autosize = input(false, { transform: booleanAttribute });
  /** Minimum height in lines when `autosize`. */
  readonly minRows = input<number | null>(null);
  /** Maximum height in lines when `autosize`, beyond which it scrolls. */
  readonly maxRows = input<number | null>(null);
  /** Native CSS `resize` behaviour — ignored when `autosize`. */
  readonly resize = input<TextareaResize>('vertical');
  /** Accessible name when no visible `label` is provided. */
  readonly ariaLabel = input<string | null>(null);
  // Signal forms binds this by name and sends undefined when the schema sets no
  // cap; the READ type stays what it was, so nothing else has to change.
  /** Hard character cap — applies the native maxlength attribute and shows a
   *  live "{current}/{max}" counter below the field. */
  readonly maxLength = input<number | null, number | null | undefined>(null, {
    transform: (value) => value ?? null,
  });

  // Signal forms binds these by name; without them a `pattern()` or `minLength()`
  // rule validated in the form model while the native element advertised nothing.
  /** Native `minlength` attribute. */
  readonly minLength = input<number | null, number | null | undefined>(null, {
    transform: (value) => value ?? null,
  });
  /** Native `pattern` attribute — signal forms sends the schema's RegExp list. */
  readonly pattern = input<readonly RegExp[], readonly RegExp[] | string | undefined>([], {
    transform: (value) =>
      value === undefined ? [] : typeof value === 'string' ? [new RegExp(value)] : value,
  });
  /** A native `pattern` takes ONE expression; the schema can carry several, so
   *  they are ANDed with lookaheads rather than silently dropping all but one. */
  protected readonly patternAttribute = computed(() => {
    const expressions = this.pattern();
    if (!expressions.length) {
      return null;
    }

    return expressions.map((expression) => `(?=${expression.source})`).join('') + '.*';
  });
  protected readonly uid = nextControlId('ds-textarea');
  protected readonly hintId = computed(() =>
    this.message().text ? `${this.uid}-hint` : null,
  );
  private readonly fieldMessage = resolveFieldMessage({
    hint: this.hint,
    warning: this.warning,
    error: this.error,
    errors: this.errors,
    invalid: this.invalid,
    touchedSelf: this.touchedSelf,
    touched: this.touched,
  });
  protected readonly message = this.fieldMessage.message;
  protected readonly invalidResolved = this.fieldMessage.invalid;
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

  protected readonly wrapperClasses = computed(() => {
    const parts = ['field'];
    if (this.size() === 'sm') {
      parts.push('sm');
    }
    if (this.size() === 'lg') {
      parts.push('lg');
    }
    if (this.invalidResolved()) {
      parts.push('error');
    }
    if (this.isDisabled()) {
      parts.push('disabled');
    }
    if (this.isReadOnly()) {
      parts.push('read-only');
    }
    if (this.autosize()) {
      parts.push('autosize');
    }

    return parts.join(' ');
  });

  protected readonly autosizeMinHeight = computed(() =>
    this.autosize() && this.minRows() ? `${this.minRows()}lh` : null,
  );
  protected readonly autosizeMaxHeight = computed(() =>
    this.autosize() && this.maxRows() ? `${this.maxRows()}lh` : null,
  );

  // Autosize grows with content, so a manual resize handle conflicts — force none.
  protected readonly effectiveResize = computed<TextareaResize>(() =>
    this.autosize() ? 'none' : this.resize(),
  );

  /** Move keyboard focus to the native textarea — public so a host can drive it
   *  deliberately, e.g. focusing the first invalid field on a failed submit. */
  focus(options?: FocusOptions): void {
    this.control()?.nativeElement.focus(options);
  }
}
