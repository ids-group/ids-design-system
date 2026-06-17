import {
  Component,
  ElementRef,
  ViewEncapsulation,
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
  readonly value = model<string>('');
  readonly placeholder = input<string>('Search');
  readonly shortcut = input<string>('');
  readonly showIcon = input<boolean>(true);
  /** Show an inline clear (×) button on the right when there's a value. */
  readonly clearable = input<boolean>(false);
  /** Accessible name for the input (placeholder is not a reliable label). */
  readonly ariaLabel = input<string>('');
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
