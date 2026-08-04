import {
  DestroyRef,
  Injector,
  Signal,
  afterNextRender,
  computed,
  inject,
  isDevMode,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormGroupDirective,
  NgControl,
  NgForm,
  type ValidationErrors,
} from '@angular/forms';
import { DS_CONFIG } from '../config/ds-config';
import type { FieldMessageState } from './field-message/field-message.component';

/**
 * One validation error, structurally identical to Angular's signal-forms
 * `ValidationError`.
 *
 * Declared here rather than imported from `@angular/forms/signals` on purpose:
 * that module is `@experimental`, and a public DS type must not carry a
 * dependency that can be renamed out from under consumers. Structural
 * compatibility is all the interop needs — signal forms binds by input NAME and
 * assigns its own `ValidationError[]`, which this shape accepts.
 */
export interface DsFieldError {
  /** Identifies the kind of error, e.g. `required`, `minlength`, `server`. */
  readonly kind: string;
  /** Human-readable text. Authored by the consumer, at the validator. */
  readonly message?: string;
}

/** What a field's `errors` input accepts before normalization. */
export type DsFieldErrorsInput =
  | string
  | DsFieldError
  | readonly DsFieldError[]
  | null
  | undefined;

const NO_ERRORS: readonly DsFieldError[] = [];

/**
 * `errors` input transform. Accepts a bare string (so a consumer that already
 * has the text can pass it directly), a single error, or the array signal forms
 * assigns.
 */
export function normalizeFieldErrors(
  value: DsFieldErrorsInput,
): readonly DsFieldError[] {
  if (!value) {
    return NO_ERRORS;
  }
  if (typeof value === 'string') {
    return value.trim() ? [{ kind: 'custom', message: value }] : NO_ERRORS;
  }

  return Array.isArray(value) ? value : [value as DsFieldError];
}

/** The single line a field shows below itself, already resolved. */
export interface DsFieldMessage {
  readonly text: string;
  readonly state: FieldMessageState;
}

export interface DsFieldMessageSources {
  hint: Signal<string>;
  warning: Signal<string>;
  error: Signal<string>;
  errors: Signal<readonly DsFieldError[]>;
  invalid: Signal<boolean>;
  /** Only `ds-input` has a success state today. */
  success?: Signal<boolean>;
  /** The field's own touched state, if it tracks one (CVA blur). */
  touchedSelf?: Signal<boolean>;
  /** Bound by signal forms as part of the `FormUiControl` contract. */
  touched?: Signal<boolean>;
}

export interface DsFieldMessageResolution {
  /** Text + state for `ds-field-message`. */
  readonly message: Signal<DsFieldMessage>;
  /** `invalid` folded together with whatever the control reports. */
  readonly invalid: Signal<boolean>;
}

const EMPTY_MESSAGE: DsFieldMessage = { text: '', state: 'default' };

interface ControlState {
  readonly errors: readonly DsFieldError[];
  readonly touched: boolean;
}

const NO_CONTROL: ControlState = { errors: NO_ERRORS, touched: false };

/**
 * Resolve the one message a field shows, from every source that can supply one.
 *
 * Precedence, highest first — the ladder Carbon uses (`invalidText` →
 * `warnText` → `helperText`) and Material's subscript follows, so only ONE line
 * ever shows and the field's height does not depend on how many sources are
 * populated:
 *
 * 1. `error` — an explicit string. Shown immediately: the consumer decided.
 * 2. `errors` — validation errors. Shown once the user has interacted, so a
 *    `required` error does not greet an untouched form.
 * 3. `warning` — advisory, not blocking.
 * 4. `hint` — helper text, and the fallback carrier for `invalid` (see below).
 *
 * Both form systems feed step 2 and neither needs the other. Signal forms binds
 * `errors` and `touched` by input name (`FormUiControl`); reactive and
 * template-driven forms expose the same through `NgControl`, read here. A given
 * field instance is driven by exactly one of them, so they cannot disagree.
 *
 * When something is invalid but no source produced TEXT, the `hint` renders in
 * the error state. That keeps the pre-existing `[invalid]="…" [hint]="errorText"`
 * idiom — which is what consumers had to write before `error` existed — working
 * unchanged.
 *
 * Call from a field initializer (an injection context).
 */
export function resolveFieldMessage(
  sources: DsFieldMessageSources,
): DsFieldMessageResolution {
  const config = inject(DS_CONFIG);
  const controlState = watchNgControl();

  const errors = computed(() => {
    const own = sources.errors();

    return own.length ? own : controlState().errors;
  });

  const interacted = computed(
    () =>
      (sources.touched?.() ?? false) ||
      (sources.touchedSelf?.() ?? false) ||
      controlState().touched,
  );

  const errorText = computed(() => {
    const current = errors();
    if (!current.length || !interacted()) {
      return '';
    }

    return textFor(current, config.field?.errorMessages);
  });

  const invalid = computed(
    () => sources.invalid() || (errors().length > 0 && interacted()),
  );

  const message = computed<DsFieldMessage>(() => {
    const explicit = sources.error().trim();
    if (explicit) {
      return { text: explicit, state: 'error' };
    }
    const fromErrors = errorText();
    if (fromErrors) {
      return { text: fromErrors, state: 'error' };
    }
    const warning = sources.warning().trim();
    if (warning) {
      return { text: warning, state: 'warning' };
    }
    const hint = sources.hint().trim();
    if (!hint) {
      return EMPTY_MESSAGE;
    }

    return {
      text: hint,
      state: invalid() ? 'error' : sources.success?.() ? 'success' : 'default',
    };
  });

  return { message, invalid };
}

/**
 * Reactive- and template-driven forms channel. `NgControl` cannot be injected
 * directly: a field provides `NG_VALUE_ACCESSOR` pointing at itself, so asking
 * for `NgControl` in the same constructor is a DI cycle. Resolving it after the
 * first render is the documented way around that.
 *
 * `events` (not `statusChanges`) is the subscription, because touching a control
 * does NOT emit a status change — it emits `TouchedChangeEvent`, and touched is
 * half of the decision to show an error at all.
 */
function watchNgControl(): Signal<ControlState> {
  const injector = inject(Injector);
  const destroyRef = inject(DestroyRef);
  // Submitting a form does not reach the child control's own `events` — the
  // event is pushed onto the ROOT form's stream — so the parent is read
  // directly, as Angular Material's ErrorStateMatcher does.
  const parentForm = inject(NgForm, { optional: true });
  const parentFormGroup = inject(FormGroupDirective, { optional: true });
  const state = signal<ControlState>(NO_CONTROL);

  afterNextRender(() => {
    const control = injector.get(NgControl, null)?.control;
    if (!control) {
      return;
    }
    const submitted = (): boolean =>
      parentFormGroup?.submitted || parentForm?.submitted || false;
    const sync = (): void =>
      state.set({
        errors: fromValidationErrors(control.errors),
        touched: control.touched || submitted(),
      });

    sync();
    control.events.pipe(takeUntilDestroyed(destroyRef)).subscribe(sync);
    const parentSubmit = parentFormGroup?.ngSubmit ?? parentForm?.ngSubmit;
    parentSubmit?.pipe(takeUntilDestroyed(destroyRef)).subscribe(sync);
  });

  return state;
}

/**
 * `ValidationErrors` is an untyped bag, so a message is picked up from the two
 * shapes consumers actually write: `{ myError: 'text' }` and
 * `{ myError: { message: 'text' } }`. Angular's own built-ins carry detail
 * objects with no message (`{ minlength: { requiredLength, actualLength } }`) —
 * those resolve through `DS_CONFIG.field.errorMessages` instead.
 */
function fromValidationErrors(
  errors: ValidationErrors | null,
): readonly DsFieldError[] {
  if (!errors) {
    return NO_ERRORS;
  }

  return Object.keys(errors).map((kind) => {
    const detail: unknown = errors[kind];
    if (typeof detail === 'string') {
      return { kind, message: detail };
    }
    const message = (detail as { message?: unknown } | null)?.message;

    return typeof message === 'string' ? { kind, message } : { kind };
  });
}

function textFor(
  errors: readonly DsFieldError[],
  messages: Record<string, string> | undefined,
): string {
  for (const error of errors) {
    const text = error.message ?? messages?.[error.kind];
    if (text) {
      return text;
    }
  }
  if (isDevMode()) {
    console.warn(
      `[ds-field] The control is invalid but no message could be resolved for ${errors
        .map((error) => `"${error.kind}"`)
        .join(
          ', ',
        )}, so the field shows an error style with no text. Give the validator a message — required(path, { message: '…' }) or { myError: 'text' } — or map the kind in provideDsConfig({ field: { errorMessages: … } }).`,
    );
  }

  return '';
}
