import { Component } from '@angular/core';
import { RouterLinkActive } from '@angular/router';
import { ButtonComponent } from '@ids-group-ltd/ids-design-system';

@Component({
  selector: 'app-orders-tab',
  imports: [ButtonComponent, RouterLinkActive],
  template: `
    <ds-button routerLink="/orders" routerLinkActive="current">Orders</ds-button>
  `,
})
export class OrdersTabComponent {}
