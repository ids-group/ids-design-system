import {
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  effect,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../icons/icon.component';
import { FieldClickFocusDirective } from '../field-click-focus.directive';
import type { DsSize } from '../../core/size';
import { inFieldGroup } from '../field-group/field-group.token';

@Component({
  selector: 'ds-search',
  standalone: true,
  imports: [FormsModule, IconComponent, FieldClickFocusDirective],
  host: { '[class.in-group]': 'inGroup' },
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class SearchComponent {
  /** Segment of a ds-field-group: the group owns the border, radius and focus
   *  ring, so .in-group strips this control back to its bare contents. */
  protected readonly inGroup = inFieldGroup();

  /** Search text, two-way bound. */
  readonly value = model<string>('');
  /** Placeholder shown when empty. */
  readonly placeholder = input<string>('Search');
  /** Keyboard shortcut hint rendered in a trailing `<kbd>` badge. */
  readonly shortcut = input<string>('');
  /** Shows the leading search icon. */
  readonly showIcon = input(true, { transform: booleanAttribute });
  /** Show an inline clear (×) button on the right when there's a value. */
  readonly clearable = input(false, { transform: booleanAttribute });
  /** Accessible name for the input (placeholder is not a reliable label). */
  readonly ariaLabel = input<string>('');
  /** Control height. `md` (default) keeps the 36px search-row height; `sm` (32px)
   *  aligns search with dense toolbars beside `sm` inputs/buttons; `lg` is touch. */
  readonly size = input<DsSize>('md');
  /** Fires with the current value on Enter. */
  readonly submitted = output<string>();
  /** Milliseconds to hold each keystroke back before `value` updates — 0 (default)
   *  writes on every keystroke, exactly as this control always has.
   *
   *  Clearing the field BYPASSES the delay, which is the part a plain
   *  `debounceTime` gets wrong: emptying a search is a deliberate act, and making
   *  the user wait 200ms to see the full list back reads as a hang. Enter flushes
   *  for the same reason. What the input SHOWS is never delayed. */
  readonly debounce = input(0, { transform: numberAttribute });

  private readonly inputEl =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');

  /** What the input shows. Separate from `value` only so typing never waits on
   *  the timer; with `debounce` at 0 the two move together. */
  protected readonly text = signal(this.value());

  private pending: ReturnType<typeof setTimeout> | null = null;
  /** The last text this component pushed into `value`, so an update arriving from
   *  the HOST can be told apart from its own echo — a host resetting the field
   *  mid-typing has to win, and cancel the keystroke still in flight. */
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

  /** Move keyboard focus to the search input. Public so a host can hand focus
   *  over deliberately — e.g. a Clear button that disables itself on activation
   *  would otherwise blur into `<body>` and restart Tab order at the top. */
  focus(options?: FocusOptions): void {
    this.inputEl()?.nativeElement.focus(options);
  }

  protected onText(next: string): void {
    this.text.set(next);
    // Empty bypasses the timer, and so does a debounce of 0.
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

  protected clear(): void {
    this.text.set('');
    this.cancel();
    this.push('');
    // The × is removed once empty; return focus to the input so keyboard
    // users don't get dropped onto <body>.
    this.inputEl()?.nativeElement.focus();
  }

  /** Write a still-waiting keystroke through now, so Enter searches what the
   *  reader can see rather than what the timer last let past. */
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

  private cancel(): void {
    if (this.pending) {
      clearTimeout(this.pending);
      this.pending = null;
    }
  }
}
