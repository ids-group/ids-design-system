import { Component, ViewEncapsulation, resource, signal } from '@angular/core';
import {
  FormField,
  email,
  form,
  minLength,
  readonly,
  required,
  submit,
  validateAsync,
  type SchemaPath,
  type SchemaPathTree,
} from '@angular/forms/signals';
import { ButtonComponent } from 'ds/button';
import { CheckboxComponent } from 'ds/checkbox';
import { InputComponent } from 'ds/input';
import { SelectComponent } from 'ds/select';
import { ShowDirtyDirective } from 'ds/show-dirty';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface Account {
  company: string;
  city: string;
}

const ACCOUNT: Account = { company: 'acme', city: 'london' };

/** Stands in for a server lookup: a value is checked for 1.5 s, and `taken` is rejected. */
function checkedLater(path: SchemaPath<string>): void {
  validateAsync(path, {
    params: ({ value }) => value(),
    factory: (params) =>
      resource({
        params,
        loader: ({ params: value, abortSignal }) =>
          new Promise<boolean>((resolve) => {
            const timer = setTimeout(() => resolve(value === 'taken'), 1500);
            abortSignal.addEventListener('abort', () => clearTimeout(timer));
          }),
      }),
    onSuccess: (rejected) =>
      rejected ? { kind: 'taken', message: 'Already registered' } : null,
    onError: () => null,
  });
}

function accountSchema(path: SchemaPathTree<Account>): void {
  checkedLater(path.company);
  checkedLater(path.city);
}

interface ContractRow {
  readonly member: string;
  readonly state: 'yes' | 'partial' | 'no';
  readonly note: string;
}

@Component({
  selector: 'practice-signal-forms',
  standalone: true,
  imports: [
    DocsSectionComponent,
    FormField,
    InputComponent,
    SelectComponent,
    CheckboxComponent,
    ButtonComponent,
    ShowDirtyDirective,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './signal-forms.section.html',
  styleUrl: './signal-forms.section.scss',
})
export class SignalFormsSection {
  protected readonly lede =
    'DS controls bind to Angular Signal Forms with no wrapper or adapter: put [formField] on the control and the form owns value, validation and disabled state.';

  protected readonly roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'partner', label: 'Partner' },
  ];

  private readonly model = signal({
    email: '',
    role: '',
    reference: 'REF-4471',
    terms: false,
  });

  protected readonly demoForm = form(this.model, (path) => {
    required(path.email, { message: 'We need an email to send the invite to' });
    email(path.email, { message: 'That does not look like an email address' });
    required(path.role, { message: 'Pick a role' });
    minLength(path.email, 6);
    readonly(path.reference);
  });

  protected readonly cities = [
    { value: 'london', label: 'London' },
    { value: 'leeds', label: 'Leeds' },
    { value: 'taken', label: 'Taken' },
  ];

  protected readonly pendingForm = form(signal({ ...ACCOUNT }), accountSchema);
  protected readonly dirtyForm = form(signal({ ...ACCOUNT }), accountSchema);

  protected readonly stateSnippet = `<form dsShowDirty>
  <ds-input label="Company" [formField]="accountForm.company" />
  <ds-select label="City" [options]="cities" [formField]="accountForm.city" />
</form>`;

  protected sendInvite(): void {
    void submit(this.demoForm, async () => undefined);
  }

  protected readonly snippet = `import { form, required, email } from '@angular/forms/signals';

model = signal({ email: '', role: '', terms: false });

loginForm = form(this.model, (path) => {
  required(path.email, { message: 'We need an email' });
  email(path.email, { message: 'That is not an email address' });
});`;

  protected readonly templateSnippet = `<ds-input label="Email" [formField]="loginForm.email" />
<ds-select label="Role" [options]="roles" [formField]="loginForm.role" />
<ds-checkbox label="I agree" [formField]="loginForm.terms" />`;

  protected readonly messagesSnippet = `provideDsConfig({
  field: {
    errorMessages: {
      required: 'This field is required',
      email: 'Enter a valid email address',
    },
  },
})`;

  protected readonly contract: ContractRow[] = [
    {
      member: 'value / checked',
      state: 'yes',
      note: 'The one required member of the contract. Every DS control already exposes it as a model(), which is why binding works without an adapter.',
    },
    {
      member: 'disabled',
      state: 'yes',
      note: 'A disabled() rule disables the control and its inner element.',
    },
    {
      member: 'readonly',
      state: 'yes',
      note: 'Input, textarea, select, autocomplete and multi-select. The DS also spells it readOnly for hand-binding; either sets it.',
    },
    {
      member: 'hidden',
      state: 'yes',
      note: 'A hidden() rule removes the control from the layout. Every control that carries a value accessor has it.',
    },
    {
      member: 'required',
      state: 'yes',
      note: 'Drives the required marker beside the label and the native attribute.',
    },
    {
      member: 'errors / touched',
      state: 'yes',
      note: 'Errors show once the field is touched, so a required error does not greet an untouched form. Give the validator a message or map the kind — see below.',
    },
    {
      member: 'invalid',
      state: 'yes',
      note: 'Applies the error styling and sets aria-invalid.',
    },
    {
      member: 'min / max / minLength / maxLength / pattern',
      state: 'yes',
      note: 'Forwarded to the native element as attributes on input and textarea; min and max also bound on the number stepper.',
    },
    {
      member: 'focus()',
      state: 'yes',
      note: 'focusBoundControl() reaches the control that actually holds the value — the stepper’s number box rather than its minus button, the tabbable radio rather than the first one, a picker’s trigger rather than an input inside its closed panel.',
    },
    {
      member: 'pending',
      state: 'yes',
      note: 'A trailing spinner while an async validator runs, on every field.',
    },
    {
      member: 'dirty',
      state: 'yes',
      note: 'A dot and a "Changed" line, opt-in: showDirty on the field, dsShowDirty on the form, or DS_CONFIG.field.showDirty.',
    },
    {
      member: 'disabledReasons',
      state: 'no',
      note: 'Not implemented.',
    },
  ];
}
