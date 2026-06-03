import { Component, ViewEncapsulation, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { TextareaSize } from './textarea.types';

let nextId = 0;

@Component({
  selector: 'ds-textarea',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class TextareaComponent {
  readonly value = model<string>('');
  readonly size = input<TextareaSize>('md');
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly optional = input<boolean>(false);
  readonly rows = input<number>(3);
  readonly name = input<string | null>(null);
  /** Accessible name when no visible `label` is provided. */
  readonly ariaLabel = input<string | null>(null);

  protected readonly uid = `ds-textarea-${++nextId}`;
  protected readonly hintId = computed(() => (this.hint() ? `${this.uid}-hint` : null));
  protected readonly resolvedAriaLabel = computed(() =>
    this.label() ? null : this.ariaLabel() || this.placeholder() || null,
  );

  protected readonly wrapperClasses = computed(() => {
    const parts = ['field'];
    if (this.size() === 'sm') parts.push('sm');
    if (this.size() === 'lg') parts.push('lg');
    if (this.invalid()) parts.push('error');
    if (this.disabled()) parts.push('disabled');
    return parts.join(' ');
  });
}
