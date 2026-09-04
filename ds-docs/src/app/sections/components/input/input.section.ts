import { Component, ViewEncapsulation } from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
  Validators,
  type ValidationErrors,
} from '@angular/forms';
import { DS_FIELD_WARNING_KIND } from 'ds/components';
import { provideDsConfig } from 'ds/core';
import { IconComponent } from 'ds/icons';
import { InputComponent } from 'ds/input';
import { ReserveMessagesDirective } from 'ds/reserve-messages';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import {
  DocsTruncationComponent,
  TruncationRule,
} from '../../../shared/docs-truncation.component';

const TAKEN_HANDLES = ['admin', 'root', 'support'];

function handleTaken(control: {
  value: string | null;
}): ValidationErrors | null {
  const value = (control.value ?? '').trim().toLowerCase();

  // The message travels WITH the error, so it beats the shared map below —
  // which is the point of the demo, not a shortcut.
  return TAKEN_HANDLES.includes(value)
    ? { taken: 'That handle is already taken' }
    : null;
}

const SHOUTY = /[A-Z]{4,}/;

function shoutyName(control: {
  value: string | null;
}): ValidationErrors | null {
  return SHOUTY.test(control.value ?? '')
    ? { [DS_FIELD_WARNING_KIND]: 'Long runs of capitals are hard to scan' }
    : null;
}

@Component({
  selector: 'section-components-input',
  standalone: true,
  imports: [
    DocsSectionComponent,
    DocsTruncationComponent,
    IconComponent,
    InputComponent,
    ReactiveFormsModule,
    ReserveMessagesDirective,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './input.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './input.section.scss'],
  providers: [
    provideDsConfig({
      field: {
        errorMessages: {
          required: 'A workspace name is required',
          minlength: 'Use at least 3 characters',
        },
      },
    }),
  ],
})
export class InputSection {
  protected readonly nameControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
  ]);
  protected readonly handleControl = new FormControl('', [handleTaken]);
  protected readonly displayControl = new FormControl('ACME HOLDINGS', [
    shoutyName,
  ]);

  protected readonly truncationRules: TruncationRule[] = [
    {
      field: 'Label',
      behaviour:
        'Single line, no clip — labels are short by spec. Wraps if forced.',
    },
    {
      field: 'Input value',
      behaviour:
        'No clip while focused (caret needs reach). Single-line ellipsis when blurred and overflowing; full value in title attr.',
    },
    {
      field: 'Hint',
      behaviour:
        'Wrap to 2 lines, then ellipsis. No tooltip — hint is itself the tooltip.',
    },
    {
      field: 'Error message',
      behaviour: 'Wrap, no clip. Always fully visible — error must never hide.',
    },
  ];
}
