import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  ButtonComponent,
  SidenavComponent,
  SidenavItemComponent,
  TopBarComponent,
} from '@ids-group-ltd/ids-design-system';
import { AuthStore } from '@app/common';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    TopBarComponent,
    SidenavComponent,
    SidenavItemComponent,
    ButtonComponent,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly user = this.authStore.currentUser;

  async logout(): Promise<void> {
    await firstValueFrom(this.authStore.logout());
    this.router.navigate(['/auth/login']);
  }
}
