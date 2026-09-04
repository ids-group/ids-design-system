import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
import { avatarTint, initialsFrom } from './avatar-tint';
import type { AvatarSize, AvatarStatus } from './avatar.types';
import { DS_CONFIG } from '@ids-group-ltd/ids-design-system/core';

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
  /** Diameter — xs/sm/lg apply a size class; md is the default. */
  readonly size = input<AvatarSize>('md');
  /** Fallback text shown when there's no `imageUrl`. Wins over anything derived
   *  from `name`, so a caller that already has the letters keeps passing them. */
  readonly initials = input<string>('');
  /** The person or thing this avatar stands for — one binding drives both the
   *  initials and the seed the tint hashes.
   *
   *  The tint keys on the NAME, never on the initials — two letters collide
   *  wholesale, so every Alice Brown and Adam Bell would share one colour. */
  readonly name = input<string>('');
  /** Replaces the built-in rule for turning `name` into initials, for one avatar
   *  or one table of them. Falls back to `DS_CONFIG.avatar.initials`, then to
   *  `initialsFrom` — first two words, a Latin-script guess the library does not
   *  pretend is universal. */
  readonly initialsRule = input<((name: string) => string) | null>(null);
  /** Image source; shown before `initials` or `fallbackIcon` when set. */
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
  /** Seed for a deterministic tint (e.g. an email) used when no explicit `tint` is
   *  set — the same seed always yields the same colour. Defaults to `name`; set it
   *  explicitly when identity is an id or an email rather than the display name. */
  readonly seed = input<string | null>(null);
  /** Hue arcs `[start, end]` (0–360°) the seeded tint must avoid, e.g. a brand
   *  hue: `[[310, 360], [0, 20]]`. Only applies when `seed` drives the tint. */
  readonly avoidHues = input<readonly (readonly [number, number])[]>([]);

  private readonly config = inject(DS_CONFIG);

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

    return value ? STATUS_ARIA_LABELS[value] : null;
  });
}
