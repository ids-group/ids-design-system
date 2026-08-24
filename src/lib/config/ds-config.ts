import { InjectionToken, Provider, inject } from '@angular/core';
import type { IconName } from '../icons/icons.data';
import type { DsSize } from '../core/size';
import type { CardElevation, CardPadding } from '../components/card/card.types';

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
    /** Leading glyph on a field's message line, per state. Defaults carry one for
     *  the three states that mean something — `error`, `warn`, `success` — and NONE
     *  for `hint`, which is the resting text rather than a state: a form where every
     *  field carries an info circle reads as noise. Each key is independent, so
     *  `{ warning: false, hint: 'info' }` turns one off and the other on. A glyph name
     *  replaces the default; `false` removes it. `stateIcons: false` removes all four,
     *  which is the one-line way to turn the glyphs off entirely.
     *
     *  WHY a glyph at all: colour alone carried error / warning / success, and in the
     *  light theme warning (#8A7400) and success (#156822) differ by hue and nothing
     *  else — which WCAG 1.4.1 forbids a state from resting on. */
    stateIcons?:
      | false
      | {
          error?: IconName | false;
          warning?: IconName | false;
          success?: IconName | false;
          /** The `default` state — the hint line. Off unless set. */
          hint?: IconName | false;
        };
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
    /** How `ds-avatar` turns its `name` into initials, app-wide. The built-in rule
     *  takes the first two words — a Latin-script guess. Reading a name is a cultural
     *  convention, so an app that knows its own provides it here. */
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
    /** Default for `dividers` on `ds-modal` and `ds-modal-card`. Default `true`.
     *  Configurable app-wide because a `ModalService` confirm renders a card with no
     *  `ds-modal` ancestor to bind — an attribute cannot reach it. */
    dividers?: boolean;
  };
  control?: {
    /** Default `size` for every control on the field-height contract. Default `'md'`.
     *
     *  A different axis from `[data-density]`: that tier rewrites hit targets and
     *  padding in CSS, this picks which of the three declared sizes a control renders
     *  at. A screen that differs still binds `size` per element. */
    size?: DsSize;
  };
  card?: {
    /** Default `elevation` for `ds-card`. Default `'flat'`. */
    elevation?: CardElevation;
    /** Default `padding` preset for `ds-card`. Unset keeps the card's own. */
    padding?: CardPadding;
  };
  table?: {
    /** Default for `ds-table`'s `stickyScrollbar` — the proxy that keeps the
     *  horizontal bar reachable on a tall table. Default `false`. A whole-app
     *  opinion in practice: one consumer binds it on all 35 of its tables, and
     *  every new table is one forgotten binding away from scrolling invisibly. */
    stickyScrollbar?: boolean;
    /** Default for `ds-table`'s `bordered` — the outer border and radius.
     *  Default `false`. Per app rather than per table in practice, which is why
     *  it is here: `provideDsConfig` scopes to a root or a route subtree, so the
     *  deliberate exceptions stay visible as bindings. */
    bordered?: boolean;
  };
  icon?: {
    /** Default pixel `size` for `ds-icon`. Default `16`. */
    size?: number;
  };
  badge?: {
    /** Default for `ds-badge`'s `withDot` — the leading status dot. Default `false`. */
    withDot?: boolean;
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
 *   providers: [provideDsConfig({ control: { size: 'sm' } })]
 *
 * Works at the app root, on a `Route`, or on a component/directive — the
 * config resolves through the element-injector chain, so a subtree can differ
 * from the app. Component inputs (e.g. `<ds-card padding="lg">`) still win.
 *
 * A nested call MERGES with the config above it, section by section, so
 * scoping one flag cannot silently drop unrelated app-level settings. Only the
 * keys you name are replaced.
 *
 * ONE call per injector, though: two in the SAME `providers` array both resolve
 * their parent with `skipSelf`, so the later one wins and the earlier is silently
 * lost. Merging happens across injector levels, not within one array.
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
