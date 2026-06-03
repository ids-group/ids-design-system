import { Component, ViewEncapsulation, computed, input, output } from '@angular/core';
import type { ButtonSize, ButtonType, ButtonVariant } from './button.types';

@Component({
  selector: 'ds-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('l');
  readonly type = input<ButtonType>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly iconOnly = input<boolean>(false);
  /** Accessible name — required for icon-only buttons (no visible text). */
  readonly ariaLabel = input<string | null>(null);
  readonly pressed = output<MouseEvent>();

  protected readonly classes = computed(() => {
    const variant = this.variant();
    const parts = [
      'button',
      variant,
      this.size(),
      this.iconOnly() ? 'icon-only' : '',
      this.loading() ? 'loading' : '',
    ];
    return parts.filter(Boolean).join(' ');
  });

  protected onClick(event: MouseEvent): void {
    if (this.disabled() || this.loading()) return;
    this.pressed.emit(event);
  }
}
