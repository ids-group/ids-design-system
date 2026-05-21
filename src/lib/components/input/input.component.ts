import { Component, ViewEncapsulation, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { InputSize, InputType } from './input.types';

@Component({
  selector: 'ds-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class InputComponent {
  readonly value = model<string>('');
  readonly type = input<InputType>('text');
  readonly size = input<InputSize>('md');
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly optional = input<boolean>(false);
  readonly name = input<string | null>(null);
  /**
   * Show an inline clear (×) button when the input has a non-empty value.
   * Mirrors the Material/PrimeNG pattern: explicit button (not native search
   * cancel) so the affordance is consistent across browsers and styled with
   * DS tokens. Defaults to true when type='search', false otherwise — pass
   * an explicit boolean to override.
   */
  readonly clearable = input<boolean | null>(null);

  protected readonly canClear = computed<boolean>(() => {
    const explicit = this.clearable();
    if (explicit !== null) return explicit;
    return this.type() === 'search';
  });

  protected readonly wrapperClasses = computed(() => {
    const parts = ['field'];
    if (this.size() === 'sm') parts.push('sm');
    if (this.size() === 'lg') parts.push('lg');
    if (this.invalid()) parts.push('error');
    if (this.disabled()) parts.push('disabled');
    return parts.join(' ');
  });

  protected clear(): void {
    this.value.set('');
  }
}
