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
  viewChild,
} from '@angular/core';
import { DS_INTL, optionalBound } from '@ids-group-ltd/ids-design-system/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DsControlValueAccessor } from '@ids-group-ltd/ids-design-system/components';
import type { TextareaResize } from './textarea.types';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';
import { FieldMessageComponent } from '@ids-group-ltd/ids-design-system/components/field-message';
import {
  resolveFieldMessage,
  trimmedText,
} from '@ids-group-ltd/ids-design-system/components';
import { nextControlId } from '@ids-group-ltd/ids-design-system/components';
import { FieldClickFocusDirective } from '@ids-group-ltd/ids-design-system/components';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';

@Component({
  selector: 'ds-textarea',
  standalone: true,
  imports: [FormsModule, FieldMessageComponent, FieldClickFocusDirective],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  host: {
    '[attr.data-field-state]': 'controlState()',
  },
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
  protected readonly intl = inject(DS_INTL);
  private readonly control =
    viewChild<ElementRef<HTMLTextAreaElement>>('control');

  /** Text value, two-way bound. */
  readonly value = model<string>('');
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
   * The contract spelling of `readOnly`, a second input because signal forms binds
   * by NAME — a `readonly()` rule was reaching nothing before this existed.
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
  /** Confirmation text, shown when there is no error or warning — and it paints
   *  the field's success border. A string like `warning`: the text IS the state. */
  readonly success = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
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
  /** Hard character cap — applies the native maxlength attribute and shows a
   *  live "{current}/{max}" counter below the field. */
  readonly maxLength = input<number | null, number | null | undefined>(null, {
    transform: optionalBound,
  });

  // Signal forms binds these by name; without them a `pattern()` or `minLength()`
  // rule validated in the form model while the native element advertised nothing.
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
  protected readonly uid = nextControlId('ds-textarea');
  protected readonly hintId = computed(() =>
    this.message().text ? `${this.uid}-hint` : null,
  );
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
    if (this.sizeResolved() === 'sm') {
      parts.push('sm');
    }
    if (this.sizeResolved() === 'lg') {
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
  override focus(options?: FocusOptions): void {
    this.control()?.nativeElement.focus(options);
  }

  /** Index of the first selected character of the native textarea; 0 before the view exists. */
  get selectionStart(): number {
    return this.control()?.nativeElement.selectionStart ?? 0;
  }

  /** Index after the last selected character of the native textarea; 0 before the view exists. */
  get selectionEnd(): number {
    return this.control()?.nativeElement.selectionEnd ?? 0;
  }

  /**
   * Mirrors `HTMLTextAreaElement.setSelectionRange`. Does not move focus - call
   * `focus()` first when the selection has to be visible. A value written through
   * `value` reaches the element a microtask later and drops the caret to the end,
   * so after `value.set(...)` set the range from a `setTimeout`, not synchronously.
   */
  setSelectionRange(
    start: number,
    end: number,
    direction?: 'forward' | 'backward' | 'none',
  ): void {
    this.control()?.nativeElement.setSelectionRange(start, end, direction);
  }

  /** Selects the whole text, as `HTMLTextAreaElement.select()` does. */
  select(): void {
    this.control()?.nativeElement.select();
  }
}
