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
import { DS_CONFIG } from '@ids-group-ltd/ids-design-system/core';
import type { FieldMessageState } from '@ids-group-ltd/ids-design-system/components/field-message';

/**
 * One validation error, structurally identical to Angular's signal-forms `ValidationError`.
 *
 * Declared here rather than imported from `@angular/forms/signals` because that module is
 * `@experimental`: a public DS type must not depend on something that can be renamed. Signal
 * forms binds by input NAME and assigns its own `ValidationError[]`, which this shape accepts.
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
 * in the warning state and does NOT make the control invalid. It is how a form model
 * raises a non-blocking remark, which `AbstractControl` has no channel for.
 */
export const DS_FIELD_WARNING_KIND = 'warning';

/**
 * `errors` input transform. Accepts a bare string, a single error, or the array signal forms
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

/** @internal */
export function trimmedText(value: string | null | undefined): string {
  return value?.trim() ?? '';
}

/** The single line a field shows below itself, already resolved.
 * @internal
 */
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
  /** The control's own disabled state. A disabled control is neither submitted nor validated, so
   *  it is not announced as invalid. A plain getter rather than a `Signal` so a caller can hand
   *  it over before its own `isDisabled` field is initialised. */
  disabled?: () => boolean;
  success?: Signal<string>;
  /** The field's own touched state, if it tracks one (CVA blur). */
  touchedSelf?: Signal<boolean>;
  /** Bound by signal forms as part of the `FormUiControl` contract. */
  touched?: Signal<boolean>;
}

export interface DsFieldMessageResolution {
  readonly message: Signal<DsFieldMessage>;
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
 * Resolves the one message a field shows, from every source that can supply one. Only ONE line
 * ever shows, so the field's height does not depend on how many sources are populated.
 *
 * Precedence, highest first:
 *
 * 1. `error` - an explicit string. Shown immediately: the consumer decided.
 * 2. `errors` - validation errors. Shown once the user has interacted, so a
 *    `required` error does not greet an untouched form.
 * 3. `warning` - advisory, not blocking.
 * 4. `errors` whose kind is `DS_FIELD_WARNING_KIND` - the same, raised by the form model.
 * 5. `success` - confirmation.
 * 6. `hint` - helper text.
 *
 * Signal forms binds `errors` and `touched` by input name (`FormUiControl`); reactive and
 * template-driven forms expose the same through `NgControl`, read here. A field instance is
 * driven by exactly one of them.
 *
 * Every rung carries its OWN text; `hint` is never recoloured into another state. `invalid` has
 * no text on purpose: it paints the control and sets `aria-invalid` when the message lives elsewhere.
 *
 * Call from a field initializer (an injection context).
 * @internal
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

  // Signal forms' ValidationError[] already carries `kind`; fromValidationErrors turns a
  // reactive validator's `{ warning: 'text' }` KEY into the same kind.
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

  // Advisory errors are deliberately absent: a warning never sets aria-invalid.
  // Disabled wins over every source of invalidity: `aria-invalid` on a NATIVELY disabled input
  // still reports invalid=true in Chrome's accessibility tree, so a reader would hear "invalid"
  // on a control they cannot act on.
  const invalid = computed(
    () =>
      !(sources.disabled?.() ?? false) &&
      (sources.invalid() ||
        sources.error().length > 0 ||
        (blocking().length > 0 && interacted())),
  );

  // Message inputs trim via `trimmedText`, so a non-empty string here is real text; a new
  // one declared without that transform breaks this quietly.
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
 * `NgControl` cannot be injected in the constructor: a field provides `NG_VALUE_ACCESSOR`
 * pointing at itself, so that is a DI cycle. Resolving it after first render avoids it.
 *
 * `events` (not `statusChanges`) is the subscription: touching a control emits
 * `TouchedChangeEvent`, not a status change, and touched gates showing an error.
 */
function watchNgControl(): Signal<ControlState> {
  const injector = inject(Injector);
  const destroyRef = inject(DestroyRef);
  // Submitting a form does not reach the child control's own `events` (it goes onto the
  // ROOT form's stream), so the parent is read directly.
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

    // Signal forms bridges an NgControl whose `control` has no `events` stream. Staying at
    // NO_CONTROL is deliberate: there the component's own inputs carry errors and touched, and
    // a snapshot frozen at first render would keep serving a stale error.
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
 * A message is picked up from `{ myError: 'text' }` and `{ myError: { message: 'text' } }`.
 * Angular's built-ins carry detail objects with no message (`{ minlength: { requiredLength } }`);
 * those resolve through `DS_CONFIG.field.errorMessages`.
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
