import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';
import type { ButtonSize, ButtonType, ButtonVariant } from './button.types';

@Component({
  selector: 'ds-button',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: { '[class.full-width]': 'fullWidth()' },
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<ButtonType>('button');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  /** Stretch the button to fill its container — the host becomes block-level
      and 100% wide (the inner control is already full-width). Use for mobile
      primary CTAs and full-bleed form submit buttons. */
  readonly fullWidth = input(false, { transform: booleanAttribute });
  /** Accessible name — forwarded to the inner <button> as aria-label. Use when
      the visible label is absent or non-descriptive. */
  readonly ariaLabel = input<string | null>(null);
  readonly icon = input<IconName | null>(null);
  readonly trailingIcon = input<IconName | null>(null);
  readonly pressed = output<MouseEvent>();

  protected readonly classes = computed(() => {
    const variant = this.variant();
    const parts = [
      'button',
      variant === 'primary' ? '' : variant,
      this.size(),
      this.loading() ? 'loading' : '',
    ];

    return parts.filter(Boolean).join(' ');
  });

  protected onClick(event: MouseEvent): void {
    if (this.disabled() || this.loading()) {
      return;
    }
    this.pressed.emit(event);
  }
}
