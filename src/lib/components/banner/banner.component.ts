import {
  Component,
  HostBinding,
  ViewEncapsulation,
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
  readonly variant = input<BannerVariant>('info');
  readonly title = input<string>('');
  readonly dismissible = input<boolean>(false);
  readonly icon = input<IconName | null>(null);
  readonly compact = input<boolean>(false);
  readonly layout = input<'stacked' | 'row'>('stacked');
  readonly accentRail = input<boolean>(true);
  readonly dismissed = output<void>();

  @HostBinding('class.no-rail')
  protected get noRail(): boolean {
    return !this.accentRail();
  }

  // Announce banners to assistive tech: errors/warnings interrupt (alert),
  // info/success wait their turn (status). A statically-rendered banner is
  // present at first paint, so a `status` region won't be re-read needlessly.
  @HostBinding('attr.role')
  protected get ariaRole(): 'alert' | 'status' {
    const value = this.variant();

    return value === 'error' || value === 'warning' || value === 'severe'
      ? 'alert'
      : 'status';
  }

  @HostBinding('attr.aria-live')
  protected get ariaLive(): 'assertive' | 'polite' {
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
    this.dismissed.emit();
  }
}
