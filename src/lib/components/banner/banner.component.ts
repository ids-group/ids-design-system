import {
  Component,
  HostBinding,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import {
  resolveWithConfig,
  warnAnnounceOversight,
} from '@ids-group-ltd/ids-design-system/core';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
import type { BannerVariant } from './banner.types';

@Component({
  selector: 'ds-banner',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
  // A static `title="…"` feeding the input below ALSO stays in the DOM as the global attribute,
  // which makes the host a native browser tooltip over everything inside it.
  host: { '[attr.title]': 'null' },
  encapsulation: ViewEncapsulation.Emulated,
})
export class BannerComponent {
  /** Severity — drives colour, the default icon and the ARIA role/live. */
  readonly variant = input<BannerVariant>('info');
  /** Optional bold heading above the message. */
  readonly title = input<string>('');
  /** Show a close button that emits `closed`. */
  readonly dismissible = input(false, { transform: booleanAttribute });
  /** Override the variant's default icon. */
  readonly icon = input<IconName | null>(null);
  /** Tighter padding, centred items, single-line title. */
  readonly compact = input(false, { transform: booleanAttribute });
  /** `'stacked'` wraps actions onto their own line; `'row'` keeps them inline. */
  readonly layout = input<'stacked' | 'row'>('stacked');
  /** Coloured accent rail on the leading edge; set false to hide it. */
  readonly accentRail = input(true, { transform: booleanAttribute });
  /** Fires when the user dismisses the banner. */
  readonly closed = output<void>();

  @HostBinding('class.no-rail')
  protected get noRail(): boolean {
    return !this.accentRail();
  }

  /** Announce this banner to a screen reader when it appears. Unset follows
   *  `DS_CONFIG.banner.announce`, then `false`.
   *
   *  Off by default: an `alert` region fires on INSERTION, so a banner that is page
   *  furniture would interrupt the reader on every route into the page. Turn it on for
   *  one the app raises in response to an event; for anything transient prefer
   *  `ToastService`, which owns a live region built for the purpose. */
  readonly announce = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });

  readonly announceResolved = resolveWithConfig(
    this.announce,
    (config) => config.banner?.announce,
    false,
  );

  private readonly liveRole = computed<'alert' | 'status'>(() => {
    const value = this.variant();

    return value === 'error' || value === 'warning' || value === 'severe'
      ? 'alert'
      : 'status';
  });

  @HostBinding('attr.role')
  protected get ariaRole(): 'alert' | 'status' | null {
    return this.announceResolved() ? this.liveRole() : null;
  }

  @HostBinding('attr.aria-live')
  protected get ariaLive(): 'assertive' | 'polite' | null {
    if (!this.announceResolved()) {
      return null;
    }

    return this.liveRole() === 'alert' ? 'assertive' : 'polite';
  }

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      warnAnnounceOversight('ds-banner', 'banner', () => ({
        variant: this.variant(),
        title: this.title(),
        assertive: this.liveRole() === 'alert',
        announce: this.announce(),
      }));
    }
  }

  protected readonly classes = computed(() => {
    const parts = ['banner', this.variant(), `layout-${this.layout()}`];
    if (this.compact()) {
      parts.push('compact');
    }

    return parts.join(' ');
  });

  protected readonly defaultIcon = computed<IconName>(() => {
    const variant = this.variant();
    if (variant === 'success') {
      return 'success';
    }
    if (variant === 'warning' || variant === 'severe') {
      return 'warn';
    }
    if (variant === 'error') {
      return 'error';
    }

    return 'info';
  });

  protected onDismiss(): void {
    this.closed.emit();
  }
}
