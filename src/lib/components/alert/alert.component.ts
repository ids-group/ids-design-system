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
import type { AlertVariant } from './alert.types';

@Component({
  selector: 'ds-alert',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class AlertComponent {
  readonly variant = input<AlertVariant>('info');
  readonly title = input<string>('');
  readonly dismissible = input(false, { transform: booleanAttribute });
  readonly icon = input<IconName | null>(null);
  readonly dismissed = output<void>();

  @HostBinding('attr.role')
  protected get ariaRole(): 'alert' | 'status' {
    const value = this.variant();

    return value === 'error' || value === 'warning' ? 'alert' : 'status';
  }

  @HostBinding('attr.aria-live')
  protected get ariaLive(): 'assertive' | 'polite' {
    return this.ariaRole === 'alert' ? 'assertive' : 'polite';
  }

  protected readonly classes = computed(() => `alert ${this.variant()}`);

  protected readonly defaultIcon = computed<IconName>(() => {
    const variant = this.variant();
    if (variant === 'success') return 'success';
    if (variant === 'warning') return 'warn';
    if (variant === 'error') return 'error';

    return 'info';
  });

  protected readonly resolvedIcon = computed<IconName>(
    () => this.icon() ?? this.defaultIcon(),
  );

  protected onDismiss(): void {
    this.dismissed.emit();
  }
}
