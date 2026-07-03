import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';
import type { AvatarSize, AvatarStatus } from './avatar.types';

const STATUS_ARIA_LABELS: Record<AvatarStatus, string> = {
  online: 'Online',
  offline: 'Offline',
  away: 'Away',
  busy: 'Busy',
};

@Component({
  selector: 'ds-avatar',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.xs]': "size() === 'xs'",
    '[class.sm]': "size() === 'sm'",
    '[class.lg]': "size() === 'lg'",
    '[class.neutral]': "tint() === 'neutral'",
    '[style.--ds-avatar-bg-color]': 'tintStyle().bg',
    '[style.--ds-avatar-label-color]': 'tintStyle().fg',
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
  /** Presence indicator shown as a colored dot in the bottom-right corner. */
  readonly status = input<AvatarStatus | null>(null);
  /** Icon rendered when there is no imageUrl and no initials. */
  readonly fallbackIcon = input<IconName | null>(null);

  protected readonly tintStyle = computed(() => {
    const value = this.tint();
    if (value && value !== 'neutral') {
      return { bg: value.bg, fg: value.fg };
    }

    return { bg: null as string | null, fg: null as string | null };
  });

  protected readonly statusAriaLabel = computed(() => {
    const value = this.status();

    return value ? STATUS_ARIA_LABELS[value] : null;
  });
}
