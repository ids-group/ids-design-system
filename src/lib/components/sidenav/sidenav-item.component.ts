import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';

@Component({
  selector: 'ds-sidenav-item',
  standalone: true,
  imports: [IconComponent, RouterLink, RouterLinkActive],
  templateUrl: './sidenav-item.component.html',
  styleUrl: './sidenav-item.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class SidenavItemComponent {
  // `icon` is optional — consumers without a DS IconName can project a custom
  // icon via the `[icon]` content slot. When both are supplied, the input
  // wins (legacy DS-consumer behaviour).
  readonly icon = input<IconName | null>(null);
  readonly label = input.required<string>();
  readonly href = input<string>('');
  // Angular RouterLink accepts both string and array forms — mirror that so
  // consumers can pass dynamic segments (e.g. `['/programs', id, 'overview']`).
  readonly routerLink = input<string | readonly unknown[] | null>(null);
  readonly active = input<boolean>(false);
  readonly badge = input<number | null>(null);
  readonly hasAlert = input<boolean>(false);

  protected readonly linkClasses = computed(() => `item${this.active() ? ' active' : ''}`);
}
