import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  ButtonComponent,
  InputComponent,
} from '@ids-group-ltd/ids-design-system';
import { AuthStore } from '@app/common';

@Component({
  selector: 'app-login-page',
  imports: [InputComponent, ButtonComponent],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly email = signal('admin@example.com');
  protected readonly password = signal('password');
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.loading.set(true);
    this.errorMessage.set('');

    const result = await firstValueFrom(
      this.authStore.login({ email: this.email(), password: this.password() }),
    );

    this.loading.set(false);

    if (result.isSuccess) {
      this.router.navigate(['/']);
    } else {
      this.errorMessage.set(result.failure?.message ?? 'Sign in failed.');
    }
  }
}
