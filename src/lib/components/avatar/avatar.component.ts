import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import type { AvatarSize } from './avatar.types';

@Component({
  selector: 'ds-avatar',
  standalone: true,
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.xs]': "size() === 'xs'",
    '[class.sm]': "size() === 'sm'",
    '[class.lg]': "size() === 'lg'",
    '[class.neutral]': "tint() === 'neutral'",
    '[style.--ds-avatar-bg]': 'tintStyle().bg',
    '[style.--ds-avatar-fg]': 'tintStyle().fg',
    '[attr.role]': "ariaLabel() ? 'img' : null",
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-hidden]': 'ariaLabel() ? null : true',
  },
})
export class AvatarComponent {
  readonly size = input<AvatarSize>('md');
  readonly initials = input<string>('');
  readonly imageUrl = input<string | null>(null);
  /** Accessible name. When omitted, the avatar is treated as decorative
   *  (hidden from AT) — correct when a visible name sits beside it. */
  readonly ariaLabel = input<string | null>(null);
  /** Off-token color tint. Accepts a `{ bg, fg }` pair for arbitrary palettes,
   *  the literal `'neutral'` for the neutral overflow-chip treatment, or null
   *  for the default brand-subtle tones from avatar.scss. */
  readonly tint = input<{ bg: string; fg: string } | 'neutral' | null>(null);

  protected readonly tintStyle = computed(() => {
    const value = this.tint();
    if (value && value !== 'neutral') return { bg: value.bg, fg: value.fg };
    return { bg: null as string | null, fg: null as string | null };
  });
}
