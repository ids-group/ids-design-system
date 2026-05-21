import { Component, ViewEncapsulation, computed, input, output } from '@angular/core';
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
  readonly dismissed = output<void>();

  protected readonly classes = computed(() => {
    const parts = ['banner', this.variant(), `layout-${this.layout()}`];
    if (this.compact()) parts.push('compact');
    return parts.join(' ');
  });

  protected readonly defaultIcon = computed<IconName>(() => {
    const variant = this.variant();
    if (variant === 'success') return 'success';
    if (variant === 'warning' || variant === 'severe') return 'warn';
    if (variant === 'error') return 'error';
    return 'info';
  });

  protected onDismiss(): void {
    this.dismissed.emit();
  }
}
