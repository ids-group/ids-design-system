import {
  Component,
  HostBinding,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';
import type { BannerVariant } from './banner.types';

@Component({
  selector: 'ds-banner',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
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

  /** Announce this banner to a screen reader when it appears.
   *
   *  Off by default, and that is the safe direction: these components are placed as
   *  page furniture as often as they are raised in response to something, and an
   *  `alert` region fires on INSERTION — so a static "maintenance on Sunday" strip
   *  interrupted the reader on every client-side route change into the page. MDN says
   *  it outright: do not use `alert` on content the user has not interacted with.
   *
   *  Turn it on for a banner the app raises in response to an event. For anything
   *  transient prefer `ToastService`, which owns a live region built for the purpose. */
  readonly announce = input(false, { transform: booleanAttribute });

  @HostBinding('attr.role')
  protected get ariaRole(): 'alert' | 'status' | null {
    if (!this.announce()) {
      return null;
    }
    const value = this.variant();

    return value === 'error' || value === 'warning' || value === 'severe'
      ? 'alert'
      : 'status';
  }

  @HostBinding('attr.aria-live')
  protected get ariaLive(): 'assertive' | 'polite' | null {
    if (!this.announce()) {
      return null;
    }

    return this.ariaRole === 'alert' ? 'assertive' : 'polite';
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
