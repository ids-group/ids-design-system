import { Component, inject } from '@angular/core';
import { AuthLayoutComponent } from '@ids-group-ltd/ids-design-system';
import { BRAND } from '../core/brand';

@Component({
  selector: 'app-auth-shell',
  imports: [AuthLayoutComponent],
  template: `
    <ds-auth-layout [brand]="brand.name" [logoLetter]="brand.letter" [tagline]="brand.tagline">
      <ng-content />
    </ds-auth-layout>
  `,
})
export class AuthShellComponent {
  protected readonly brand = inject(BRAND);
}
