import { Component, ViewEncapsulation, signal } from '@angular/core';
import {
  ButtonComponent,
  InputComponent,
  PasswordRulesComponent,
  type DsPasswordRule,
} from 'ds';
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
  styleUrls: ['../../../shared/section-demo.scss'],
})
export class PasswordRulesSection {
  protected readonly password = signal('');
  protected readonly submitted = signal(false);

  // The consumer owns the policy — these predicates are what has to mirror the
  // server, which is why the component takes them rather than inventing rules.
  protected readonly rules: readonly DsPasswordRule[] = [
    { label: 'At least 8 characters', test: (v) => v.length >= 8 },
    { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
    { label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
    { label: 'One number', test: (v) => /[0-9]/.test(v) },
  ];
}
