import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ButtonComponent } from 'ds/button';
import { InputComponent } from 'ds/input';
import { PasswordRulesComponent } from 'ds/password-rules';
import type { DsPasswordRule } from 'ds/password-rules';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-password-rules',
  standalone: true,
  imports: [
    DocsSectionComponent,
    InputComponent,
    PasswordRulesComponent,
    ButtonComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './password-rules.section.html',
  styleUrls: [
    '../../../shared/section-demo.scss',
    './password-rules.section.scss',
  ],
})
export class PasswordRulesSection {
  protected readonly password = signal('');
  protected readonly widePassword = signal('');
  protected readonly submitted = signal(false);

  // The consumer owns the policy — these predicates are what has to mirror the
  // server, which is why the component takes them rather than inventing rules.
  protected readonly rules: readonly DsPasswordRule[] = [
    { label: 'At least 8 characters', test: (value) => value.length >= 8 },
    { label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
    { label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
    { label: 'One number', test: (value) => /[0-9]/.test(value) },
  ];
}
