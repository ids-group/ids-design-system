import {
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  input,
  model,
  viewChildren,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { SegmentedOption } from './segmented.types';

@Component({
  selector: 'ds-segmented',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './segmented.component.html',
  styleUrl: './segmented.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'radiogroup',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class SegmentedComponent {
  readonly options = input<readonly SegmentedOption[]>([]);
  readonly value = model<string>('');
  readonly ariaLabel = input<string | null>(null);

  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('seg');

  // The single roving-tabindex entry point: the selected segment, or the first
  // enabled one when nothing is selected yet.
  protected readonly focusableValue = computed(() => {
    const value = this.value();
    const options = this.options();
    if (options.some((option) => option.value === value && !option.disabled)) {
      return value;
    }

    return options.find((option) => !option.disabled)?.value ?? null;
  });

  protected select(option: SegmentedOption): void {
    if (option.disabled) {
      return;
    }
    this.value.set(option.value);
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const options = this.options();
    let target = -1;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        target = this.nextEnabled(index, 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        target = this.nextEnabled(index, -1);
        break;
      case 'Home':
        target = this.nextEnabled(-1, 1);
        break;
      case 'End':
        target = this.nextEnabled(options.length, -1);
        break;
      default:
        return;
    }
    if (target < 0) {
      return;
    }
    event.preventDefault();
    this.value.set(options[target].value);
    this.buttons()[target]?.nativeElement.focus();
  }

  private nextEnabled(from: number, step: number): number {
    const options = this.options();
    const count = options.length;
    if (count === 0) {
      return -1;
    }
    let index = from;
    for (let i = 0; i < count; i++) {
      index = (index + step + count) % count;
      if (!options[index].disabled) {
        return index;
      }
    }

    return -1;
  }
}
