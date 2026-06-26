import {
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  output,
  viewChildren,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DsControlValueAccessor } from '../control-value-accessor';

export type OtpMode = 'numeric' | 'alphanumeric';

@Component({
  selector: 'ds-otp-input',
  standalone: true,
  templateUrl: './otp-input.component.html',
  styleUrl: './otp-input.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OtpInputComponent),
      multi: true,
    },
  ],
  host: {
    role: 'group',
    '[attr.aria-label]': 'ariaLabel()',
    '[class.invalid]': 'invalid()',
  },
})
export class OtpInputComponent extends DsControlValueAccessor<string> {
  readonly value = model<string>('');
  readonly length = input<number>(6);
  readonly mode = input<OtpMode>('numeric');
  readonly mask = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string>('Verification code');
  readonly completed = output<string>();

  private readonly boxes = viewChildren<ElementRef<HTMLInputElement>>('box');
  private wasComplete = false;

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  // Fixed-length, position-preserving view of the current value.
  protected readonly cells = computed<string[]>(() => {
    const value = this.value().slice(0, this.length());

    return Array.from({ length: this.length() }, (_, i) => value[i] ?? '');
  });

  protected onInput(event: Event, index: number): void {
    const element = event.target as HTMLInputElement;
    const cleaned = this.sanitize(element.value);
    if (!cleaned) {
      this.writeCell(index, '');
      element.value = '';

      return;
    }
    if (cleaned.length === 1) {
      this.writeCell(index, cleaned);
      element.value = cleaned;
      this.focusBox(index + 1);
    } else {
      this.distribute(cleaned, index);
    }
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    switch (event.key) {
      case 'Backspace':
        if (!this.cells()[index]) {
          event.preventDefault();
          this.writeCell(index - 1, '');
          this.focusBox(index - 1);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.focusBox(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.focusBox(index + 1);
        break;
      default:
        break;
    }
  }

  protected onPaste(event: ClipboardEvent, index: number): void {
    const text = event.clipboardData?.getData('text') ?? '';
    const cleaned = this.sanitize(text);
    if (!cleaned) {
      return;
    }
    event.preventDefault();
    this.distribute(cleaned, index);
  }

  protected onFocus(event: FocusEvent, index: number): void {
    (event.target as HTMLInputElement).select();
    // Keep entry left-packed: redirect focus to the first empty cell so the user
    // can't type into a gap (the flat value string can't represent middle gaps).
    const firstEmpty = this.firstEmptyIndex();
    if (firstEmpty >= 0 && index > firstEmpty) {
      this.focusBox(firstEmpty);
    }
  }

  protected cellLabel(index: number): string {
    const noun = this.mode() === 'numeric' ? 'Digit' : 'Character';

    return `${noun} ${index + 1}`;
  }

  protected onBlur(): void {
    this.markTouched();
  }

  private writeCell(index: number, char: string): void {
    if (index < 0 || index >= this.length()) {
      return;
    }
    const next = this.cells().slice();
    next[index] = char;
    this.commit(next);
  }

  private distribute(text: string, startIndex: number): void {
    const next = this.cells().slice();
    let cursor = startIndex;
    for (const char of text) {
      if (cursor >= this.length()) {
        break;
      }
      next[cursor] = char;
      cursor++;
    }
    this.commit(next);
    this.focusBox(Math.min(cursor, this.length() - 1));
  }

  private commit(cells: string[]): void {
    const value = cells.join('').slice(0, this.length());
    this.value.set(value);
    // Fire `completed` only on the partial → full transition, not on every
    // edit of an already-complete code (which would re-trigger consumers).
    const complete = value.length === this.length();
    if (complete && !this.wasComplete) {
      this.completed.emit(value);
    }
    this.wasComplete = complete;
  }

  private firstEmptyIndex(): number {
    return this.cells().findIndex((cell) => cell === '');
  }

  private focusBox(index: number): void {
    const box = this.boxes()[index]?.nativeElement;
    if (box) {
      box.focus();
      box.select();
    }
  }

  private sanitize(raw: string): string {
    const pattern = this.mode() === 'numeric' ? /[^0-9]/g : /[^0-9a-zA-Z]/g;

    return raw.replace(pattern, '');
  }
}
