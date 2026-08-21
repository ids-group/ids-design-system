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
 * The one reserved `DsFieldError.kind`. An error carrying it is advisory: it shows
 * in the warning state and does NOT make the control invalid, which is how a form
 * model can raise a non-blocking remark — Angular's own `AbstractControl` has no
 * channel for one, only `errors` and the validity derived from it.
 */
export const DS_FIELD_WARNING_KIND = 'warning';

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

export function trimmedText(value: string | null | undefined): string {
  return value?.trim() ?? '';
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
  success?: Signal<string>;
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
  /**
   * The state the CONTROL paints, for `[attr.data-field-state]`. Deliberately not
   * `message().state`: a field can be in a state with nothing to say, and can have
   * text in a state the box does not paint.
   */
  readonly controlState: Signal<FieldMessageState | null>;
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
 * 4. `errors` whose kind is `DS_FIELD_WARNING_KIND` — the same, raised by the form model.
 * 5. `success` — confirmation.
 * 6. `hint` — helper text.
 *
 * Both form systems feed step 2 and neither needs the other. Signal forms binds
 * `errors` and `touched` by input name (`FormUiControl`); reactive and
 * template-driven forms expose the same through `NgControl`, read here. A given
 * field instance is driven by exactly one of them, so they cannot disagree.
 *
 * Every rung carries its OWN text, and `hint` is never recoloured into somebody
 * else's state. `invalid` is the one input with no text on purpose: it paints the
 * control and sets `aria-invalid` for when the message lives elsewhere — a
 * form-level error summary, or one message for a whole field group.
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

  // Both form systems land here, so one reserved kind serves both: signal forms
  // assigns its own ValidationError[] (which already carries `kind`), and
  // fromValidationErrors turns a reactive validator's `{ warning: 'text' }` KEY
  // into the same kind.
  const blocking = computed(() =>
    errors().filter((error) => error.kind !== DS_FIELD_WARNING_KIND),
  );
  const advisory = computed(() =>
    errors().filter((error) => error.kind === DS_FIELD_WARNING_KIND),
  );

  const errorText = computed(() => {
    const current = blocking();
    if (!current.length || !interacted()) {
      return '';
    }

    return textFor(current, config.field?.errorMessages);
  });

  const advisoryText = computed(() => {
    const current = advisory();
    if (!current.length || !interacted()) {
      return '';
    }

    return textFor(current, config.field?.errorMessages);
  });

  // Advisory errors are deliberately absent: a warning does not make a control
  // invalid, so it never sets aria-invalid and never blocks a submit guard.
  const invalid = computed(
    () =>
      sources.invalid() ||
      sources.error().length > 0 ||
      (blocking().length > 0 && interacted()),
  );

  // Message inputs trim via `trimmedText`, so a non-empty string here is real
  // text — a new one declared without that transform breaks this quietly.
  const message = computed<DsFieldMessage>(() => {
    const explicit = sources.error();
    if (explicit) {
      return { text: explicit, state: 'error' };
    }
    const fromErrors = errorText();
    if (fromErrors) {
      return { text: fromErrors, state: 'error' };
    }
    const warning = sources.warning();
    if (warning) {
      return { text: warning, state: 'warning' };
    }
    const fromAdvisory = advisoryText();
    if (fromAdvisory) {
      return { text: fromAdvisory, state: 'warning' };
    }
    const success = sources.success?.();
    if (success) {
      return { text: success, state: 'success' };
    }
    const hint = sources.hint();

    return hint ? { text: hint, state: 'default' } : EMPTY_MESSAGE;
  });

  const paintedState = computed<FieldMessageState | null>(() => {
    if (invalid()) {
      return 'error';
    }
    if (sources.warning() || advisoryText()) {
      return 'warning';
    }

    return sources.success?.() ? 'success' : null;
  });

  return { message, invalid, controlState: paintedState };
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

    // Signal forms bridges an NgControl whose `control` has no `events` stream.
    // Reaching for it threw once per field on every page binding `[field]`, and
    // then this snapshot froze at the first render — after which the fallback in
    // `errors` above served that stale error every time the live ones went empty,
    // so a field that had become VALID still showed its first failure. Leave the
    // state at NO_CONTROL instead: on that path the component's own inputs carry
    // errors and touched, and a half-updating second source can only fight them.
    if (typeof control.events?.pipe !== 'function') {
      return;
    }

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
        )}, so the field paints the state with NO message under it. Give the validator a message — required(path, { message: '…' }) or { myError: 'text' } — or map the kind in provideDsConfig({ field: { errorMessages: … } }).`,
    );
  }

  return '';
}
