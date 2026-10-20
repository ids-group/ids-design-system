import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent, InputComponent } from '@ids-group-ltd/ids-design-system';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error.set('Email or password is incorrect.');
        this.submitting.set(false);
      },
    });
  }
}
