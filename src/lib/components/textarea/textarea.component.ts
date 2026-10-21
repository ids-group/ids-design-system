import {
  Component,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
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
import type { TextareaMaxLengthMode, TextareaResize } from './textarea.types';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';
import {
  FieldMessageComponent,
  FieldStatusComponent,
} from '@ids-group-ltd/ids-design-system/components/field-message';
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
  imports: [
    FormsModule,
    FieldMessageComponent,
    FieldStatusComponent,
    FieldClickFocusDirective,
  ],
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
  private readonly overflowMirror =
    viewChild<ElementRef<HTMLDivElement>>('overflowMirror');

  /** Text value, two-way bound. */
  readonly value = model<string>('');
  /** Field height; falls back to `DS_CONFIG.control.size`, then `'md'`. */
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
  /** The contract spelling of `readOnly`: signal forms binds by NAME, so a `readonly()` rule reaches nothing without it. */
  readonly readonlyBinding = input(false, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: 'readonly',
    transform: booleanAttribute,
  });
  protected readonly isReadOnly = computed(
    () => this.readOnly() || this.readonlyBinding(),
  );
  /** Confirmation text, shown when there is no error or warning; paints the success border. */
  readonly success = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** Marks the field required - shows an asterisk and sets `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Shows an "(optional)" marker next to the label (ignored when `required`). */
  readonly optional = input(false, { transform: booleanAttribute });
  /** Native `rows` attribute - visible line count. */
  readonly rows = input<number>(3);
  /** Native `name` attribute. */
  readonly name = input<string | null>(null);
  /** Grows the field with content instead of scrolling; forces `resize` to none. */
  readonly autosize = input(false, { transform: booleanAttribute });
  /** Minimum height in lines when `autosize`. */
  readonly minRows = input<number | null>(null);
  /** Maximum height in lines when `autosize`, beyond which it scrolls. */
  readonly maxRows = input<number | null>(null);
  /** Native CSS `resize` behaviour - ignored when `autosize`. */
  readonly resize = input<TextareaResize>('vertical');
  /** Accessible name when no visible `label` is provided. */
  readonly ariaLabel = input<string | null>(null);
  /** Character limit with a live "{current}/{max}" counter; `maxLengthMode` decides what happens at the limit.
   *  Counts `value.length` (UTF-16 units, as native `maxlength` does) unless `countTrimmed` is set. */
  readonly maxLength = input<number | null, number | null | undefined>(null, {
    transform: optionalBound,
  });
  /** `'hard'` applies the native maxlength attribute. `'soft'` lets the text run past it: the counter turns red, the excess is
   *  highlighted and the field reports invalid (`aria-invalid`). */
  readonly maxLengthMode = input<TextareaMaxLengthMode>('hard');
  /** Leaves leading and trailing whitespace out of the counter, soft-limit state and highlight.
   *  The native `maxlength` of `maxLengthMode="hard"` counts every character regardless. */
  readonly countTrimmed = input(false, { transform: booleanAttribute });
  private readonly countedRange = computed(() => {
    const value = this.value();
    if (!this.countTrimmed()) {
      return { start: 0, end: value.length };
    }
    const start = value.length - value.trimStart().length;

    return { start, end: Math.max(start, value.trimEnd().length) };
  });
  protected readonly currentLength = computed(() => {
    const { start, end } = this.countedRange();

    return end - start;
  });
  protected readonly overLimitBy = computed(() => {
    const limit = this.maxLength();

    return this.maxLengthMode() === 'soft' && limit !== null
      ? Math.max(0, this.currentLength() - limit)
      : 0;
  });
  protected readonly overflowParts = computed(() => {
    const value = this.value();
    const { end } = this.countedRange();
    let splitAt = end - this.overLimitBy();
    // A limit inside a surrogate pair marks the whole pair: half a pair renders at another width and shifts every mirrored line after it.
    // A limit inside an emoji ZWJ sequence still shifts them; Intl.Segmenter graphemes would not (Firefox 125+).
    const previous = value.charCodeAt(splitAt - 1);
    if (previous >= 0xd800 && previous <= 0xdbff) {
      splitAt -= 1;
    }

    return {
      within: value.slice(0, splitAt),
      over: value.slice(splitAt, end),
      after: value.slice(end),
    };
  });

  // Signal forms binds these by name; without them the native element advertises no rule.
  /** Native `minlength` attribute. */
  readonly minLength = input<number | null, number | null | undefined>(null, {
    transform: optionalBound,
  });
  /** Native `pattern` attribute - signal forms sends the schema's RegExp list. */
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
  /** A native `pattern` takes one expression; several are ANDed with lookaheads. */
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
    this.message().text || this.changedShown() ? `${this.uid}-hint` : null,
  );
  private readonly fieldMessage = resolveFieldMessage({
    pending: this.pending,
    dirty: this.dirty,
    showDirty: this.showDirtyResolved,
    disabled: () => this.isDisabled(),
    hint: this.hint,
    warning: this.warning,
    error: this.error,
    errors: this.errors,
    invalid: computed(() => this.invalid() || this.overLimitBy() > 0),
    success: this.success,
  });
  protected readonly message = this.fieldMessage.message;
  protected readonly pendingShown = this.fieldMessage.pending;
  protected readonly changedShown = this.fieldMessage.changed;
  protected readonly controlState = this.fieldMessage.controlState;
  protected readonly invalidResolved = this.fieldMessage.invalid;
  protected readonly resolvedAriaLabel = computed(() =>
    this.label() ? null : this.ariaLabel() || this.placeholder() || null,
  );

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  protected readonly counterId = computed(() =>
    this.maxLength() !== null ? `${this.uid}-counter` : null,
  );
  protected readonly describedBy = computed(
    () =>
      [this.hintId(), this.overLimitBy() > 0 ? this.counterId() : null]
        .filter(Boolean)
        .join(' ') || null,
  );
  protected readonly nativeMaxLength = computed(() =>
    this.maxLengthMode() === 'hard' ? this.maxLength() : null,
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
    if (this.maxLengthMode() === 'soft' && this.maxLength() !== null) {
      parts.push('soft-limit');
    }

    return parts.join(' ');
  });

  protected readonly autosizeMinHeight = computed(() =>
    this.autosize() && this.minRows() ? `${this.minRows()}lh` : null,
  );
  protected readonly autosizeMaxHeight = computed(() =>
    this.autosize() && this.maxRows() ? `${this.maxRows()}lh` : null,
  );

  protected readonly effectiveResize = computed<TextareaResize>(() =>
    this.autosize() ? 'none' : this.resize(),
  );

  constructor() {
    super();
    afterRenderEffect({
      write: () => {
        // The textarea scrolls on input before the mirror re-renders, so the `(scroll)` sync alone leaves the mirror behind.
        this.overflowParts();
        this.syncOverflowScroll();
      },
    });
  }

  protected syncOverflowScroll(): void {
    const mirror = this.overflowMirror()?.nativeElement;
    const control = this.control()?.nativeElement;
    if (mirror && control) {
      mirror.scrollTop = control.scrollTop;
    }
  }

  /** Moves keyboard focus to the native textarea. */
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
   * Mirrors `HTMLTextAreaElement.setSelectionRange`; does not move focus. A value written through `value` reaches the
   * element a microtask later and drops the caret to the end, so after `value.set(...)` set the range from a `setTimeout`.
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
