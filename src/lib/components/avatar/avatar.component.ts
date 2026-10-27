import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
import { avatarTint, initialsFrom } from './avatar-tint';
import type { AvatarSize, AvatarStatus } from './avatar.types';
import { DS_CONFIG, DS_INTL } from '@ids-group-ltd/ids-design-system/core';

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
  /** Diameter. */
  readonly size = input<AvatarSize>('md');
  /** Fallback text shown when there is no `imageUrl`. Wins over initials derived from `name`. */
  readonly initials = input<string>('');
  /** The person or thing this avatar stands for; drives the initials and the tint seed. */
  readonly name = input<string>('');
  /** Replaces the rule turning `name` into initials. Falls back to
   *  `DS_CONFIG.avatar.initials`, then to `initialsFrom` (first two words, Latin script). */
  readonly initialsRule = input<((name: string) => string) | null>(null);
  /** Image source; shown before `initials` or `fallbackIcon` when set. An image that fails to
   *  load falls back to them until the URL changes. */
  readonly imageUrl = input<string | null>(null);
  /** Accessible name. When omitted, the avatar is decorative (hidden from AT). */
  readonly ariaLabel = input<string | null>(null);
  /** Tint: a `{ bg, fg }` pair, the literal `'neutral'` for the overflow-chip look, or null
   *  for the default brand-subtle tones. */
  readonly tint = input<{ bg: string; fg: string } | 'neutral' | null>(null);
  /** Presence dot in the bottom-right corner. */
  readonly status = input<AvatarStatus | null>(null);
  /** Icon rendered when there is no imageUrl and no initials. */
  readonly fallbackIcon = input<IconName | null>(null);
  /** Seed for the deterministic tint when no `tint` is set. Defaults to `name`; set it when
   *  identity is an id or an email rather than the display name. */
  readonly seed = input<string | null>(null);
  /** Hue arcs `[start, end]` (0-360 degrees) the seeded tint avoids, e.g. `[[310, 360], [0, 20]]`.
   *  Only applies when `seed` drives the tint. */
  readonly avoidHues = input<readonly (readonly [number, number])[]>([]);

  private readonly config = inject(DS_CONFIG);
  protected readonly intl = inject(DS_INTL);

  protected readonly imageFailed = linkedSignal({
    source: this.imageUrl,
    computation: () => false,
  });

  protected readonly initialsText = computed(() => {
    const explicit = this.initials();
    if (explicit) {
      return explicit;
    }
    const name = this.name();
    if (!name) {
      return '';
    }
    const rule = this.initialsRule() ?? this.config.avatar?.initials;

    return rule ? rule(name) : initialsFrom(name);
  });

  protected readonly tintStyle = computed(() => {
    const value = this.tint();
    if (value === 'neutral') {
      return { bg: null as string | null, fg: null as string | null };
    }
    if (value) {
      return { bg: value.bg, fg: value.fg };
    }

    const seed = this.seed() ?? this.name();
    if (seed) {
      return avatarTint(seed, { avoidHues: this.avoidHues() });
    }

    return { bg: null as string | null, fg: null as string | null };
  });

  protected readonly statusAriaLabel = computed(() => {
    const value = this.status();

    return value ? this.intl().avatar[value] : null;
  });
}
