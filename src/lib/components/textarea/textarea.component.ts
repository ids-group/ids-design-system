import { Component, ViewEncapsulation, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { TextareaSize } from './textarea.types';

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

  protected readonly wrapperClasses = computed(() => {
    const parts = ['field'];
    if (this.size() === 'sm') parts.push('sm');
    if (this.size() === 'lg') parts.push('lg');
    if (this.invalid()) parts.push('error');
    if (this.disabled()) parts.push('disabled');
    return parts.join(' ');
  });
}
