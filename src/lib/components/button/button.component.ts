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
import type { ButtonColor, ButtonVariant, ButtonType } from './button.types';
import type { DsSize } from '../../core/size';

// color×variant pairs that RENDER but read poorly — surfaced as a dev-mode
// console.warn (two inputs can't be narrowed against each other at compile
// time). They are discouraged, not blocked: a brand may still opt in.
const DISCOURAGED_COMBOS = new Map<string, string>([
  [
    'neutral|solid',
    'a solid grey button reads as disabled — prefer tonal/ghost/outline',
  ],
  [
    'success|ghost',
    'low-emphasis success rarely warrants an action affordance — prefer solid/tonal',
  ],
  [
    'success|outline',
    'low-emphasis success rarely warrants an action affordance — prefer solid/tonal',
  ],
  [
    'warning|ghost',
    'yellow at low emphasis is too low-contrast to read — prefer solid/tonal',
  ],
  [
    'warning|outline',
    'yellow at low emphasis is too low-contrast to read — prefer solid/tonal',
  ],
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
  /** Brand/status hue family. */
  readonly color = input<ButtonColor>('primary');
  /** Fill pattern: solid | tonal | ghost | outline | text. All color×variant
      pairs render; some are UX-discouraged (see DISCOURAGED_COMBOS / the docs)
      and emit a dev-mode warning — they work, but read poorly. `text` is
      discouraged for ALL colours — prefer the global `.link` class; it stays for
      cases needing the ds-button API (loading/fullWidth/typed pressed). */
  readonly variant = input<ButtonVariant>('solid');
  /** Button height — sm/md/lg. */
  readonly size = input<DsSize>('md');
  /** Native `<button>` `type` attribute. */
  readonly type = input<ButtonType>('button');
  /** Disables the button and blocks `pressed`. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Busy state — disables interaction and sets `aria-busy`. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Stretch the button to fill its container — the host becomes block-level
      and 100% wide (the inner control is already full-width). Use for mobile
      primary CTAs and full-bleed form submit buttons. */
  readonly fullWidth = input(false, { transform: booleanAttribute });
  /** Accessible name — forwarded to the inner <button> as aria-label. Use when
      the visible label is absent or non-descriptive. */
  readonly ariaLabel = input<string | null>(null);
  /** Leading icon, before the projected content. */
  readonly icon = input<IconName | null>(null);
  /** Trailing icon, after the projected content. */
  readonly trailingIcon = input<IconName | null>(null);
  /** ARIA `aria-haspopup`, forwarded to the inner <button> — set when this
   *  button triggers a menu/dialog/listbox overlay. */
  readonly ariaHasPopup = input<
    'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | null
  >(null);
  /** ARIA `aria-expanded`, forwarded to the inner <button> — bind to the
   *  overlay's open state on a trigger button. */
  readonly ariaExpanded = input<boolean | null>(null);
  /** Fires on click, unless `disabled` or `loading`. */
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
        const variant = this.variant();
        if (variant === 'text') {
          console.warn(
            '[ds-button] variant="text" is discouraged — prefer the global `.link` class for link-styled actions. It renders, but `.link` is the canonical link affordance.',
          );

          return;
        }
        const reason = DISCOURAGED_COMBOS.get(`${this.color()}|${variant}`);
        if (reason) {
          console.warn(
            `[ds-button] color="${this.color()}" variant="${variant}" is a UX-discouraged combination — it renders, but ${reason}.`,
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
