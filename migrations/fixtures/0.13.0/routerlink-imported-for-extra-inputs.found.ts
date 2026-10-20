import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '@ids-group-ltd/ids-design-system';

@Component({
  selector: 'app-open-orders-link',
  imports: [ButtonComponent, RouterLink],
  template: `
    <ds-button routerLink="/orders" [queryParams]="{ status: 'open' }">Open orders</ds-button>
  `,
})
export class OpenOrdersLinkComponent {}
