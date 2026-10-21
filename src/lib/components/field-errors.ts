import {
  DestroyRef,
  InjectionToken,
  Injector,
  Signal,
  afterNextRender,
  computed,
  inject,
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
import { reportDevWarning } from '@ids-group-ltd/ids-design-system/core';
import type { FieldMessageState } from '@ids-group-ltd/ids-design-system/components/field-message';

/**
 * One validation error, structurally identical to Angular's signal-forms `ValidationError`.
 *
 * Declared here because `@angular/forms/signals` is `@experimental`. Signal forms binds by
 * input NAME and assigns its own `ValidationError[]`, which this shape accepts.
 */
export interface DsFieldError {
  /** Identifies the kind of error, e.g. `required`, `minlength`, `server`. */
  readonly kind: string;
  /** Human-readable text. */
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
 * The one reserved `DsFieldError.kind`. An error carrying it is advisory: it shows in the
 * warning state and does NOT make the control invalid.
 */
export const DS_FIELD_WARNING_KIND = 'warning';

/**
 * The submit flag `[dsSubmitted]` provides to the fields inside it: validation errors show only
 * while it reads `true`.
 */
export const DS_SUBMITTED = new InjectionToken<Signal<boolean>>('DS_SUBMITTED');

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
  /** Errors the control raises itself (an unparseable date), shown on the same terms as `errors`. */
  ownErrors?: Signal<readonly DsFieldError[]>;
  invalid: Signal<boolean>;
  /** The control's own disabled state (a disabled control is not announced as invalid). A getter,
   *  not a `Signal`, so a caller can hand it over before its own `isDisabled` is initialised. */
  disabled?: () => boolean;
  success?: Signal<string>;
  /** Bound by signal forms; an async validator is running. */
  pending?: Signal<boolean>;
  /** Bound by signal forms; the user changed the value. */
  dirty?: Signal<boolean>;
  /** The field's resolved `showDirty`: whether a changed value is marked. */
  showDirty?: Signal<boolean>;
}

export interface DsFieldMessageResolution {
  readonly message: Signal<DsFieldMessage>;
  readonly invalid: Signal<boolean>;
  /** The state the CONTROL paints, for `[attr.data-field-state]`; not `message().state`, which can differ. */
  readonly controlState: Signal<FieldMessageState | null>;
  /** An async validator is running: from `pending`, or the `NgControl`'s status. */
  readonly pending: Signal<boolean>;
  /** The value was changed and the field marks it (`showDirty`). */
  readonly changed: Signal<boolean>;
}

const EMPTY_MESSAGE: DsFieldMessage = { text: '', state: 'default' };

interface ControlState {
  readonly errors: readonly DsFieldError[];
  readonly submitted: boolean;
  readonly pending: boolean;
  readonly dirty: boolean;
}

const NO_CONTROL: ControlState = {
  errors: NO_ERRORS,
  submitted: false,
  pending: false,
  dirty: false,
};

/**
 * Resolves the one message a field shows, from every source that can supply one.
 *
 * Precedence, highest first:
 *
 * 1. `error` - an explicit string. Shown immediately: the consumer decided.
 * 2. `errors` - validation errors. Shown once the form is submitted: `[dsSubmitted]` reads
 *    `true`, or the parent `NgForm` / `FormGroupDirective` was submitted. Never on blur.
 * 3. `warning` - advisory, not blocking.
 * 4. `errors` whose kind is `DS_FIELD_WARNING_KIND` - the same, raised by the form model.
 * 5. `success` - confirmation.
 * 6. `hint` - helper text.
 *
 * Signal forms binds `errors` and `invalid` by input name (`FormUiControl`); reactive and
 * template-driven forms expose the same through `NgControl`, read here. `invalid` with errors
 * behind it waits for the submit like them; `invalid` alone was set by the consumer and paints
 * immediately.
 *
 * Every rung carries its OWN text; `hint` is never recoloured into another state. `invalid` has
 * no text: it paints the control and sets `aria-invalid`.
 *
 * Call from a field initializer (an injection context).
 * @internal
 */
export function resolveFieldMessage(
  sources: DsFieldMessageSources,
): DsFieldMessageResolution {
  const config = inject(DS_CONFIG);
  const submittedFlag = inject(DS_SUBMITTED, { optional: true });
  const controlState = watchNgControl();

  const errors = computed(() => {
    const bound = sources.errors();
    const fromForm = bound.length ? bound : controlState().errors;
    const own = sources.ownErrors?.() ?? NO_ERRORS;

    return own.length ? [...own, ...fromForm] : fromForm;
  });

  const revealed = computed(
    () => (submittedFlag?.() ?? false) || controlState().submitted,
  );

  const blocking = computed(() =>
    errors().filter((error) => error.kind !== DS_FIELD_WARNING_KIND),
  );
  const advisory = computed(() =>
    errors().filter((error) => error.kind === DS_FIELD_WARNING_KIND),
  );

  const errorText = computed(() => {
    const current = blocking();
    if (!current.length || !revealed()) {
      return '';
    }

    return textFor(current, config.field?.errorMessages);
  });

  const advisoryText = computed(() => {
    const current = advisory();
    if (!current.length || !revealed()) {
      return '';
    }

    return textFor(current, config.field?.errorMessages);
  });

  // Advisory errors are deliberately absent: a warning never sets aria-invalid.
  // Disabled wins: `aria-invalid` on a NATIVELY disabled input still reports invalid in
  // Chrome's accessibility tree.
  const invalid = computed(
    () =>
      !(sources.disabled?.() ?? false) &&
      (sources.error().length > 0 ||
        (blocking().length > 0 ? revealed() : sources.invalid())),
  );

  // Relies on message inputs trimming via `trimmedText`; one declared without it breaks this quietly.
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

  const pending = computed(
    () => (sources.pending?.() ?? false) || controlState().pending,
  );
  const changed = computed(
    () =>
      (sources.showDirty?.() ?? false) &&
      ((sources.dirty?.() ?? false) || controlState().dirty),
  );

  return { message, invalid, controlState: paintedState, pending, changed };
}

/**
 * `NgControl` cannot be injected in the constructor (`NG_VALUE_ACCESSOR` points at the field
 * itself: a DI cycle), so it is resolved after first render.
 *
 * `events`, not `statusChanges`: editing a control emits `PristineChangeEvent`, not a status change.
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
        submitted: submitted(),
        pending: control.pending,
        dirty: control.dirty,
      });
    // `resetForm()` resets the controls (their events fire here) BEFORE it clears `submitted`.
    const syncNowAndAfterReset = (): void => {
      sync();
      queueMicrotask(sync);
    };

    // Signal forms bridges an NgControl whose `control` has no `events` stream. Staying at
    // NO_CONTROL is deliberate: the component's own inputs carry errors and invalid there.
    if (typeof control.events?.pipe !== 'function') {
      return;
    }

    sync();
    control.events
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(syncNowAndAfterReset);
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
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    reportDevWarning(
      `[ds-field] The control is invalid but no message could be resolved for ${errors
        .map((error) => `"${error.kind}"`)
        .join(
          ', ',
        )}, so the field paints the state with NO message under it. Give the validator a message — required(path, { message: '…' }) or { myError: 'text' } — or map the kind in provideDsConfig({ field: { errorMessages: … } }).`,
    );
  }

  return '';
}
