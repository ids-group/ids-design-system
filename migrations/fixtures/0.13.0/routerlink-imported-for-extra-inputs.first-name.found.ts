import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonComponent } from '@ids-group-ltd/ids-design-system';

@Component({
  selector: 'app-open-orders-link',
  imports: [ButtonComponent, RouterLink, RouterLinkActive],
  template: `
    <ds-button routerLink="/orders" routerLinkActive="current" [queryParams]="{ status: 'open' }">
      Open orders
    </ds-button>
  `,
})
export class OpenOrdersLinkComponent {}
