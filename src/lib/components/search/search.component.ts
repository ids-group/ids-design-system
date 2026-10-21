import {
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormsModule,
  NG_VALUE_ACCESSOR,
  type ControlValueAccessor,
} from '@angular/forms';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { valueControlBridge } from '@ids-group-ltd/ids-design-system/components';
import { FieldClickFocusDirective } from '@ids-group-ltd/ids-design-system/components';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';
import { inFieldGroup } from '@ids-group-ltd/ids-design-system/components/field-group';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';

@Component({
  selector: 'ds-search',
  standalone: true,
  imports: [FormsModule, IconComponent, FieldClickFocusDirective],
  host: {
    '[class.in-group]': 'inGroup',
    '[style.display]': 'hidden() ? "none" : null',
  },
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchComponent),
      multi: true,
    },
  ],
})
/**
 * A toolbar filter with no message row; where a label or error line is needed, use `ds-input`.
 */
export class SearchComponent implements ControlValueAccessor {
  protected readonly intl = inject(DS_INTL);
  protected readonly inGroup = inFieldGroup();

  private readonly bridge = valueControlBridge<string>(() => this.value);

  /** Inline `display`, not the attribute: the host sets its own `display`, which beats the UA `[hidden]` rule. */
  readonly hidden = input(false, { transform: booleanAttribute });

  /** Driven by the forms API, OR'd into `isDisabled`. */
  protected readonly formDisabled = this.bridge.formDisabled;

  /** Search text, two-way bound. */
  readonly value = model<string>('');
  /** Placeholder when empty; falls back to `DS_INTL.search.placeholder`. */
  readonly placeholder = input<string | null>(null);
  readonly placeholderResolved = computed(
    () => this.placeholder() ?? this.intl().search.placeholder,
  );
  /** Keyboard shortcut hint rendered in a trailing `<kbd>` badge. */
  readonly shortcut = input<string>('');
  /** Shows the leading search icon. */
  readonly showIcon = input(true, { transform: booleanAttribute });
  /** Show an inline clear (×) button on the right when there's a value. */
  readonly clearable = input(false, { transform: booleanAttribute });
  /** Accessible name for the input (placeholder is not a reliable label). */
  readonly ariaLabel = input<string>('');
  /** Disables the input and the clear button. */
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  /** Control height; falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** Fires with the current value on Enter. */
  readonly submitted = output<string>();
  /** Milliseconds to hold each keystroke back before `value` updates; 0 (default) writes on every keystroke.
   *  Clearing bypasses the delay and Enter flushes; the displayed text is never delayed. */
  readonly debounce = input(0, { transform: numberAttribute });

  private readonly inputEl =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');

  /** What the input shows. Separate from `value` so typing never waits on the timer. */
  protected readonly text = signal(this.value());

  private pending: ReturnType<typeof setTimeout> | null = null;
  /** The last text pushed into `value`, to tell a host update from the component's own echo: a host reset mid-typing must win. */
  private pushed = this.value();

  constructor() {
    // focusBoundControl() calls focus() on the host; see DsControlValueAccessor.
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.focus = (
      options?: FocusOptions,
    ) => this.focus(options);
    effect(() => {
      const incoming = this.value();
      if (incoming !== this.pushed) {
        this.cancel();
        this.pushed = incoming;
        this.text.set(incoming);
      }
    });
  }

  /** Moves focus to the search input. */
  focus(options?: FocusOptions): void {
    this.inputEl()?.nativeElement.focus(options);
  }

  /** Drops focus from the search input. */
  blur(): void {
    this.inputEl()?.nativeElement.blur();
  }

  protected onText(next: string): void {
    this.text.set(next);
    if (this.debounce() > 0 && next !== '') {
      this.cancel();
      this.pending = setTimeout(() => {
        this.pending = null;
        this.push(next);
      }, this.debounce());

      return;
    }
    this.cancel();
    this.push(next);
  }

  protected onSubmit(): void {
    this.flush();
    this.submitted.emit(this.value());
  }

  /** Empties the field, drops any armed keystroke and publishes '' immediately.
   *  Writing `''` into `value` is not equivalent: the timer is cancelled only when the text differs from the last pushed value. */
  clear(): void {
    this.text.set('');
    this.cancel();
    this.push('');
    // The × is removed once empty, so focus would fall to <body>.
    this.inputEl()?.nativeElement.focus();
  }

  private flush(): void {
    if (this.pending) {
      this.cancel();
      this.push(this.text());
    }
  }

  private push(next: string): void {
    this.pushed = next;
    this.value.set(next);
  }

  writeValue(next: string): void {
    this.bridge.writeValue(next);
  }

  registerOnChange(fn: (next: string) => void): void {
    this.bridge.registerOnChange(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.bridge.registerOnTouched(fn);
  }

  setDisabledState(isDisabled: boolean): void {
    this.bridge.setDisabledState(isDisabled);
  }

  /** Reported to the forms API on blur, so a search inside a form goes `ng-touched`. */
  protected markTouched(): void {
    this.bridge.markTouched();
  }

  private cancel(): void {
    if (this.pending) {
      clearTimeout(this.pending);
      this.pending = null;
    }
  }
}
