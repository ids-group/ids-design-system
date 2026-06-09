import { Component, ViewEncapsulation, booleanAttribute, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { TextareaSize, TextareaResize } from './textarea.types';

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
  readonly autosize = input(false, { transform: booleanAttribute });
  readonly minRows = input<number | null>(null);
  readonly maxRows = input<number | null>(null);
  readonly resize = input<TextareaResize>('vertical');
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
    if (this.autosize()) parts.push('autosize');
    return parts.join(' ');
  });

  protected readonly autosizeMinHeight = computed(() =>
    this.autosize() && this.minRows() ? `${this.minRows()}lh` : null,
  );
  protected readonly autosizeMaxHeight = computed(() =>
    this.autosize() && this.maxRows() ? `${this.maxRows()}lh` : null,
  );

  // Autosize grows with content, so a manual resize handle conflicts — force none.
  protected readonly effectiveResize = computed<TextareaResize>(() =>
    this.autosize() ? 'none' : this.resize(),
  );
}
