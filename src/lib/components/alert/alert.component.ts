import {
  Component,
  HostBinding,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import {
  DS_INTL,
  resolveWithConfig,
  warnAnnounceOversight,
} from '@ids-group-ltd/ids-design-system/core';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
import { moveFocusOutOf } from '@ids-group-ltd/ids-design-system/components';
import type { AlertVariant } from './alert.types';

@Component({
  selector: 'ds-alert',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
  host: { '[attr.title]': 'null' },
  encapsulation: ViewEncapsulation.Emulated,
})
export class AlertComponent {
  protected readonly intl = inject(DS_INTL);

  /** Severity: drives colour, the default icon and the ARIA role/live. */
  readonly variant = input<AlertVariant>('info');
  /** Optional bold heading above the message. */
  readonly title = input<string>('');
  /** Show a close button that emits `closed`. */
  readonly dismissible = input(false, { transform: booleanAttribute });
  /** Override the variant's default icon. */
  readonly icon = input<IconName | null>(null);
  /** Fires when the user dismisses the alert. */
  readonly closed = output<void>();

  /** Announce this alert to a screen reader when it appears. Unset follows
   *  `DS_CONFIG.alert.announce`, then `false`. */
  readonly announce = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });

  readonly announceResolved = resolveWithConfig(
    this.announce,
    (config) => config.alert?.announce,
    false,
  );

  private readonly liveRole = computed<'alert' | 'status'>(() => {
    const value = this.variant();

    return value === 'error' || value === 'warning' ? 'alert' : 'status';
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
      warnAnnounceOversight('ds-alert', 'alert', () => ({
        variant: this.variant(),
        title: this.title(),
        assertive: this.liveRole() === 'alert',
        announce: this.announce(),
      }));
    }
  }

  protected readonly classes = computed(() => `alert ${this.variant()}`);

  protected readonly defaultIcon = computed<IconName>(() => {
    const variant = this.variant();
    if (variant === 'success') {
      return 'success';
    }
    if (variant === 'warning') {
      return 'warn';
    }
    if (variant === 'error') {
      return 'error';
    }

    return 'info';
  });

  protected readonly resolvedIcon = computed<IconName>(
    () => this.icon() ?? this.defaultIcon(),
  );

  // The host app removes the element on `closed`, taking the focused close button with it.
  protected onDismiss(leaving: HTMLElement): void {
    moveFocusOutOf(leaving, leaving.ownerDocument.body);
    this.closed.emit();
  }
}
