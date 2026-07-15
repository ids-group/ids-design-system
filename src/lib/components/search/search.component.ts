import {
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'ds-search',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class SearchComponent {
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
  /** Fires with the current value on Enter. */
  readonly submitted = output<string>();

  private readonly inputEl =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected onSubmit(): void {
    this.submitted.emit(this.value());
  }

  protected clear(): void {
    this.value.set('');
    // The × is removed once empty; return focus to the input so keyboard
    // users don't get dropped onto <body>.
    this.inputEl()?.nativeElement.focus();
  }
}
