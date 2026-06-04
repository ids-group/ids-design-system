import { Component, ViewEncapsulation, computed, input, output } from '@angular/core';
import type { ButtonSize, ButtonType, ButtonVariant } from './button.types';

@Component({
  selector: 'ds-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: { '[class.is-block]': 'block()' },
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('l');
  readonly type = input<ButtonType>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly iconOnly = input<boolean>(false);
  /** Stretch the button to fill its container (replaces per-page ::ng-deep width hacks). */
  readonly block = input<boolean>(false);
  /** Accessible label, forwarded to the inner <button>. Required for icon-only buttons. */
  readonly ariaLabel = input<string>('');
  readonly pressed = output<MouseEvent>();

  protected readonly classes = computed(() => {
    const variant = this.variant();
    const parts = [
      'button',
      variant === 'primary' ? '' : variant,
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
