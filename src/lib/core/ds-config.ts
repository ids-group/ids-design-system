import { InjectionToken, Provider, inject } from '@angular/core';
import type { IconName } from './icon-names';
import type { DsSize } from './size';
import type { CardElevation, CardPadding } from './card.types';
import type {
  ChartDataTable,
  ChartFrame,
  ChartRendering,
  ChartValueFormat,
} from './chart.types';
import type { DsToastPosition } from './toast-position';
import type { PaginationLayout } from './pagination.types';

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
     *  `error`, `warning` and `success` and NONE for `hint`, which is resting text
     *  rather than a state. Each key is independent — a glyph name replaces the
     *  default, `false` removes it, and `stateIcons: false` removes all four.
     *
     *  The glyphs exist because warning and success differ from each other by hue
     *  and nothing else, which WCAG 1.4.1 forbids a state from resting on. */
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
     *  takes the first two words, which is a Latin-script guess — an app whose names
     *  follow another convention supplies its own here. */
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
    /* No accent key on purpose: a two-tone wordmark is projected markup
       (`[dsBrandName]`), so the consumer says where the accent belongs. A config
       string would have to be split back apart, which is the guessing the
       projection exists to avoid. */
  };
  modal?: {
    /** Default for `dividers` on `ds-modal` and `ds-modal-card`. Default `true`.
     *  Configurable app-wide because a `ModalService` confirm renders a card with no
     *  `ds-modal` ancestor to bind — an attribute cannot reach it. */
    dividers?: boolean;
  };
  banner?: {
    /** Default for every `ds-banner`'s `announce`. Default `false`, because an
     *  `alert` region fires on INSERTION: a banner that is page furniture would
     *  interrupt the reader on every route into the page. Set `true` where the app
     *  raises banners in response to events, and bind `[announce]="false"` on the
     *  furniture. `ds-alert` has its own key, so the two can differ. */
    announce?: boolean;
  };
  alert?: {
    /** Default for every `ds-alert`'s `announce`. Default `false`, for the reason
     *  under `banner.announce`. */
    announce?: boolean;
  };
  toast?: {
    /** Where the stack sits. Merged field by field over the built-in
     *  `right` / `top` / `var(--space-6)`, so naming one key keeps the other two. */
    position?: Partial<DsToastPosition>;
    /** Maximum number of toasts visible at once. Extras are queued and shown as
     *  earlier ones dismiss. Default `5`; `0` means unlimited. */
    maxVisible?: number;
    /** Show a `+N` strip while toasts wait behind `maxVisible`. Default `true`. */
    showQueueCount?: boolean;
  };
  picker?: {
    /** Default for `ds-multi-select``s `searchable`. `true` always shows the panel's
     *  filter row, `false` never, and a NUMBER is a threshold — the row appears once
     *  there are at least that many options. Default `true`. One threshold for the
     *  app is the point: left to each call site, two panels of the same length in
     *  the same screen end up disagreeing. */
    searchable?: boolean | number;
  };

  control?: {
    /** Default `size` for every control on the field-height contract. Default `'md'`.
     *
     *  A different axis from `[data-density]`: that tier rewrites hit targets and
     *  padding in CSS, this picks which of the three declared sizes a control renders
     *  at. A screen that differs still binds `size` per element. */
    size?: DsSize;
  };
  pagination?: {
    /** Default `size` for every pager, `ds-table`'s footer included. Unset falls back to
     *  `control.size`, so this is where a pager gets bigger targets than the rest of the
     *  controls without resizing them all. */
    size?: DsSize;
    /** Default `layout` for every pager, `ds-table`'s footer included. Default `'grouped'`. */
    layout?: PaginationLayout;
  };
  card?: {
    /** Default `elevation` for `ds-card`. Default `'flat'`. */
    elevation?: CardElevation;
    /** Default `padding` preset for `ds-card`. Unset keeps the card's own. */
    padding?: CardPadding;
  };
  table?: {
    /** Default for `ds-table`'s `stickyScrollbar` — the proxy that keeps the
     *  horizontal bar reachable on a tall table. Default `false`. Here rather than
     *  per table because every new table is one forgotten binding away from
     *  scrolling invisibly. */
    stickyScrollbar?: boolean;
    /** Default for `ds-table`'s `bordered` — the outer border and radius.
     *  Default `false`. */
    bordered?: boolean;
    /** Default for `ds-table`'s `stickyScrollbarOffset` — where the sticky horizontal bar comes
     *  to rest, as any CSS length. Unset, each table measures its own scroll container's bottom
     *  padding and cancels it, which puts the bar on the edge the reader sees; set this for an app
     *  whose scrollports end somewhere else, so every table agrees without a binding each. */
    stickyScrollbarOffset?: string;
  };
  icon?: {
    /** Default pixel `size` for `ds-icon`. Default `16`. */
    size?: number;
  };
  badge?: {
    /** Default for `ds-badge`'s `withDot` — the leading status dot. Default `false`. */
    withDot?: boolean;
  };
  chart?: {
    /** Default `dataTable` for all five charts. Default `'none'`. It is an accessibility policy
     *  rather than a per-chart taste — whether the numbers behind a plot have a non-visual route is
     *  decided once for an app, not thirty times, so an app that wants the annex everywhere sets
     *  `'toggle'` here once rather than on every chart. Off by default: a chart usually sits in a
     *  page that already carries its numbers, and an unasked-for disclosure under every plot is
     *  chrome the page did not ask for. */
    dataTable?: ChartDataTable;
    /** Whether every chart draws its own bordered, padded box. Default `'auto'`, which draws it.
     *  Whether charts live inside cards is decided once for an app — a page that puts every chart
     *  in a card sets `'none'` here rather than reaching into five components' chrome from a
     *  global stylesheet. */
    frame?: ChartFrame;
    /** How long every chart's tooltip stays after the pointer leaves the mark, in milliseconds.
     *  Default 0. Raise it only where the panels carry something a reader has to reach — WCAG
     *  1.4.13's hoverable clause — which is a property of what an app puts in its tooltips rather
     *  than of one plot. About 140 is enough to cross the gap at an ordinary pointer speed. */
    tooltipLingerMs?: number;
    /** Shown in place of the plot when a chart's data is empty. Default `'No data'`. */
    emptyText?: string;
    /** Shown in place of the plot when a chart has `error` set. Default
     *  `'Could not load the data'`. */
    errorText?: string;
    /** How every chart formats its values, the annex table and the generated description included.
     *  Default is the browser's locale grouping with a K/M/B suffix past four digits. The same
     *  reason `datePicker.locale` lives here: a number reads one way in an app, and a formatter
     *  passed per chart drifts as soon as there are two screens. */
    valueFormat?: ChartValueFormat;
    /** How charts build themselves on a long page: build each one as it nears the viewport, build
     *  ahead while idle, skip the ones off screen. All off by default. */
    rendering?: ChartRendering;
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
 * Works at the app root, on a `Route`, or on a component/directive — the config
 * resolves through the element-injector chain, so a subtree can differ from the
 * app. Component inputs (e.g. `<ds-card padding="lg">`) still win.
 *
 * A nested call MERGES with the config above it section by section; only the keys
 * you name are replaced. ONE call per injector, though: two in the SAME
 * `providers` array both resolve their parent with `skipSelf`, so the later wins
 * and the earlier is silently lost.
 */
export function provideDsConfig(config: DsConfig): Provider {
  return { provide: DS_CONFIG, useFactory: () => inheritDsConfig(config) };
}

/**
 * The factory body behind `provideDsConfig`, exported so a directive can put the
 * provider in its metadata as a plain object literal. Calling `provideDsConfig`
 * there instead runs at module-evaluation time, which makes the module
 * side-effectful and costs the consumer its tree-shaking (measured at +566 kB
 * moved into the eager chunk).
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
