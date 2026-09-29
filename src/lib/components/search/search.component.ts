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
 * Takes the CVA bridge rather than `DsControlValueAccessor` (which carries `DsFieldBase`): a search box is a toolbar filter with no message row;
 * where a label or error line is needed, use `ds-input`.
 */
export class SearchComponent implements ControlValueAccessor {
  protected readonly intl = inject(DS_INTL);
  protected readonly inGroup = inFieldGroup();

  private readonly bridge = valueControlBridge<string>(() => this.value);

  /** Hides the control, as every DS control does. Inline `display`, not the attribute: the host sets its own, which the weaker UA rule loses to. */
  readonly hidden = input(false, { transform: booleanAttribute });

  /** Driven by the forms API, OR'd into `isDisabled`. */
  protected readonly formDisabled = this.bridge.formDisabled;

  /** Search text, two-way bound. */
  readonly value = model<string>('');
  /** Placeholder shown when empty.
   *  Unset falls back to `DS_INTL.search.placeholder`. */
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
  /** Control height. `md` (default) is the 36px search-row height; `sm` (32px) aligns with dense toolbars; `lg` is touch.
   *  Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** Fires with the current value on Enter. */
  readonly submitted = output<string>();
  /** Milliseconds to hold each keystroke back before `value` updates; 0 (default) writes on every keystroke.
   *  Clearing the field BYPASSES the delay (waiting to see the full list back reads as a hang), and Enter flushes.
   *  What the input SHOWS is never delayed. */
  readonly debounce = input(0, { transform: numberAttribute });

  private readonly inputEl =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');

  /** What the input shows. Separate from `value` so typing never waits on the timer. */
  protected readonly text = signal(this.value());

  private pending: ReturnType<typeof setTimeout> | null = null;
  /** The last text this component pushed into `value`, to tell a HOST update from its own echo: a host reset mid-typing must win and cancel the keystroke in flight. */
  private pushed = this.value();

  constructor() {
    effect(() => {
      const incoming = this.value();
      if (incoming !== this.pushed) {
        this.cancel();
        this.pushed = incoming;
        this.text.set(incoming);
      }
    });
  }

  /** Public so a host can hand focus over deliberately, e.g. a Clear button that disables itself on activation would otherwise blur into `<body>`. */
  focus(options?: FocusOptions): void {
    this.inputEl()?.nativeElement.focus(options);
  }

  /** Drops focus from the search input - the counterpart of `focus()`. */
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

  /** Empties the field, DROPS any armed keystroke, and publishes '' immediately. Public for host-owned Clear buttons.
   *  Writing `''` into `value` is not equivalent: the effect only cancels the timer when the text DIFFERS from the last pushed value. */
  clear(): void {
    this.text.set('');
    this.cancel();
    this.push('');
    // The × is removed once empty; return focus to the input so keyboard users are not dropped onto <body>.
    this.inputEl()?.nativeElement.focus();
  }

  /** So Enter searches what the reader can see, not what the timer last let past. */
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
