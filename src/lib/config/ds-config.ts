import { InjectionToken, Provider, inject } from '@angular/core';
import type { IconName } from '../icons/icons.data';

export interface DsConfig {
  field?: {
    /** Default for every field's `reserveMessage` — keeps a message line's worth
     *  of space even when empty. Default `false`. Setting `true` here applies to
     *  EVERY field in the injector's subtree, which is rarely what a whole app
     *  wants; prefer `dsReserveMessages` on the individual form that validates. */
    reserveMessage?: boolean;
    /** Fallback text per validation-error kind, for errors whose validator did
     *  not carry a `message` — Angular's built-ins never do, so this is where
     *  `required`, `minlength`, `email` and friends get their wording. A message
     *  on the error itself always wins, so one shared map here plus a per-case
     *  override at the validator covers both. Unmapped kinds warn in dev. */
    errorMessages?: Record<string, string>;
  };
  breadcrumbs?: {
    separator?: IconName;
    clickable?: boolean;
  };
  timePicker?: {
    /** Display format for `ds-time-picker` / date-picker time — 24h or 12h AM/PM. Default `'24h'`. */
    format?: '24h' | '12h';
  };
  avatar?: {
    /** How `ds-avatar` turns its `name` into initials, app-wide. The built-in
     *  rule takes the first two words, which is a Latin-script guess and nothing
     *  more: reading a name is a cultural convention rather than a UI decision, so
     *  an app that knows its own — first+surname for people, first two words for
     *  organisations — provides it here instead of asking the library to guess. */
    initials?: (name: string) => string;
  };
  brand?: {
    /** Brand text for `ds-sidenav` and `ds-auth-layout` — the wordmark, and the
     *  source of the letter-mark's glyph when `logoLetter` is unset. */
    name?: string;
    /** Letter-mark glyph when it differs from the brand's first character. */
    logoLetter?: string;
    /** Strapline under the brand row. `ds-auth-layout` only. */
    tagline?: string;
    /* No accent here on purpose. A two-tone wordmark is PROJECTED markup
       (`[dsBrandName]`) so the consumer says where the accent belongs; a config
       could only carry a string, and splitting it back apart — the `indexOf`
       every app ends up writing — is the guessing the projection exists to
       avoid. Provide the name here and project the accented version where a
       screen needs one. */
  };
  modal?: {
    /** Default for `dividers` on `ds-modal` and `ds-modal-card` — the rules under
     *  the header and over the actions, and the padding they were sized for.
     *  Default `true`. Here rather than only per-element because it is a
     *  whole-app opinion in practice, and because a `ModalService` confirm
     *  renders a card with no `ds-modal` ancestor to bind: an attribute cannot
     *  reach it, an injected default can. */
    dividers?: boolean;
  };
  datePicker?: {
    /** BCP-47 locale for `ds-date-picker` names + value format. Default `'en-US'`. */
    locale?: string;
    /** Explicit token format e.g. `'MM/DD/YYYY'`; overrides the locale-derived order. */
    dateFormat?: string;
    /** First weekday column: 0=Sunday … 6=Saturday. Default `1` (Monday). */
    firstDayOfWeek?: number;
  };
}

export const DS_CONFIG = new InjectionToken<DsConfig>('DS_CONFIG', {
  factory: () => ({}),
});

/** Provide DS-level defaults.
 *
 *   providers: [provideDsConfig({ card: { padding: 'sm' } })]
 *
 * Works at the app root, on a `Route`, or on a component/directive — the
 * config resolves through the element-injector chain, so a subtree can differ
 * from the app. Component inputs (e.g. `<ds-card padding="lg">`) still win.
 *
 * A nested call MERGES with the config above it, section by section, so
 * scoping one flag cannot silently drop unrelated app-level settings. Only the
 * keys you name are replaced.
 */
export function provideDsConfig(config: DsConfig): Provider {
  return { provide: DS_CONFIG, useFactory: () => inheritDsConfig(config) };
}

/**
 * The factory body behind `provideDsConfig`, exported so a directive can put the
 * provider in its metadata as a plain object literal. Calling `provideDsConfig`
 * there instead would run at module-evaluation time, which makes the module
 * side-effectful and costs the consumer its tree-shaking (measured: the whole
 * library moved into ds-docs' eager chunk, +566 kB).
 *
 * Must be called from an injection context.
 */
export function inheritDsConfig(config: DsConfig): DsConfig {
  return mergeDsConfig(
    inject(DS_CONFIG, { skipSelf: true, optional: true }) ?? {},
    config,
  );
}

function mergeDsConfig(parent: DsConfig, own: DsConfig): DsConfig {
  const merged: DsConfig = { ...parent };
  for (const section of Object.keys(own) as (keyof DsConfig)[]) {
    Object.assign(merged, {
      [section]: { ...parent[section], ...own[section] },
    });
  }

  return merged;
}
