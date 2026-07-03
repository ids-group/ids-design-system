import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ds-menu-divider',
  standalone: true,
  template: '<hr class="divider" aria-hidden="true" />',
  styleUrl: './menu-divider.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: { role: 'separator', 'aria-orientation': 'horizontal' },
})
export class MenuDividerComponent {}
