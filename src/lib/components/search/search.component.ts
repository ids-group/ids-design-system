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
import { FieldClickFocusDirective } from '../field-click-focus.directive';
import type { DsSize } from '../../core/size';

@Component({
  selector: 'ds-search',
  standalone: true,
  imports: [FormsModule, IconComponent, FieldClickFocusDirective],
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
  /** Control height. `md` (default) keeps the 36px search-row height; `sm` (32px)
   *  aligns search with dense toolbars beside `sm` inputs/buttons; `lg` is touch. */
  readonly size = input<DsSize>('md');
  /** Fires with the current value on Enter. */
  readonly submitted = output<string>();

  private readonly inputEl =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');

  /** Move keyboard focus to the search input. Public so a host can hand focus
   *  over deliberately — e.g. a Clear button that disables itself on activation
   *  would otherwise blur into `<body>` and restart Tab order at the top. */
  focus(options?: FocusOptions): void {
    this.inputEl()?.nativeElement.focus(options);
  }

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
