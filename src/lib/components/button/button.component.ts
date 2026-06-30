import {
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  input,
  isDevMode,
  output,
  viewChild,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';
import type { ButtonColor, ButtonVariant, ButtonSize, ButtonType } from './button.types';

// color×variant pairs we don't support (rendered but dev-warned — two inputs
// can't be narrowed against each other at compile time): grey solid reads as
// disabled; quiet success/warning variants are too low-contrast.
const BANNED_COMBOS = new Set([
  'neutral|solid',
  'success|ghost',
  'success|outline',
  'warning|ghost',
  'warning|outline',
]);

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
  readonly color = input<ButtonColor>('primary');
  readonly variant = input<ButtonVariant>('solid');
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
  /** ARIA `aria-haspopup`, forwarded to the inner <button> — set when this
   *  button triggers a menu/dialog/listbox overlay. */
  readonly ariaHasPopup = input<
    'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | null
  >(null);
  /** ARIA `aria-expanded`, forwarded to the inner <button> — bind to the
   *  overlay's open state on a trigger button. */
  readonly ariaExpanded = input<boolean | null>(null);
  readonly pressed = output<MouseEvent>();

  /** The inner native <button>, exposed so overlay triggers can position
   *  against and restore focus to the real focusable element — e.g.
   *  `(pressed)="pop.toggle(trigger.buttonRef().nativeElement)"`. */
  readonly buttonRef = viewChild.required<ElementRef<HTMLButtonElement>>('btn');

  protected readonly classes = computed(() => {
    const color = this.color();
    const variant = this.variant();
    const parts = [
      'button',
      color === 'primary' ? '' : `c-${color}`,
      variant === 'solid' ? '' : `v-${variant}`,
      this.size(),
      this.loading() ? 'loading' : '',
    ];

    return parts.filter(Boolean).join(' ');
  });

  constructor() {
    if (isDevMode()) {
      effect(() => {
        const combo = `${this.color()}|${this.variant()}`;
        if (BANNED_COMBOS.has(combo)) {
          console.warn(
            `[ds-button] color="${this.color()}" variant="${this.variant()}" is not a supported combination — see the button docs for the legal color×variant matrix.`,
          );
        }
      });
    }
  }

  protected onClick(event: MouseEvent): void {
    if (this.disabled() || this.loading()) {
      return;
    }
    this.pressed.emit(event);
  }
}
