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
  /** BCP-47 locale every component formats numbers and dates in (chart values, `ds-date-picker`,
   *  file sizes in `ds-dropzone`). Default is Angular's `LOCALE_ID`, so the library prints numbers
   *  the way the app's own `| number` does. A section key that names a locale
   *  (`datePicker.locale`) wins over this. */
  locale?: string;
  field?: {
    /** Default for every field's `reserveMessage`: keeps a message line's worth of space even
     *  when empty. Default `false`. `true` here applies to EVERY field in the injector's subtree,
     *  which is rarely what a whole app wants; prefer `dsReserveMessages` on the form that
     *  validates. */
    reserveMessage?: boolean;
    /** Fallback text per validation-error kind, for errors whose validator carries no `message`
     *  (Angular's built-ins never do: `required`, `minlength`, `email`). A message on the error
     *  itself always wins. Unmapped kinds warn in dev. */
    errorMessages?: Record<string, string>;
    /** Leading glyph on a field's message line, per state. Defaults carry one for `error`,
     *  `warning` and `success` and NONE for `hint`, which is resting text. Each key is
     *  independent: a glyph name replaces the default, `false` removes it, and
     *  `stateIcons: false` removes all four.
     *
     *  Warning and success would otherwise differ by hue alone, which WCAG 1.4.1 forbids. */
    stateIcons?:
      | false
      | {
          error?: IconName | false;
          warning?: IconName | false;
          success?: IconName | false;
          /** The `default` state (the hint line). Off unless set. */
          hint?: IconName | false;
        };
  };
  breadcrumbs?: {
    separator?: IconName;
    clickable?: boolean;
  };
  timePicker?: {
    /** Display format for `ds-time-picker` / date-picker time - 24h or 12h AM/PM. Default `'24h'`. */
    format?: '24h' | '12h';
  };
  avatar?: {
    /** How `ds-avatar` turns its `name` into initials, app-wide. The built-in rule takes the
     *  first two words, a Latin-script guess; an app with another naming convention supplies its own. */
    initials?: (name: string) => string;
  };
  brand?: {
    /** Brand text for `ds-sidenav` and `ds-auth-layout`: the wordmark, and the source of the
     *  letter-mark's glyph when `logoLetter` is unset. */
    name?: string;
    /** Letter-mark glyph when it differs from the brand's first character. */
    logoLetter?: string;
    /** Strapline under the brand row. `ds-auth-layout` only. */
    tagline?: string;
    /* No accent key on purpose: a two-tone wordmark is projected markup (`[dsBrandName]`),
       because a config string would have to be split back apart by guessing. */
  };
  modal?: {
    /** Default for `dividers` on `ds-modal` and `ds-modal-card`. Default `true`. App-wide because
     *  a `ModalService` confirm renders a card with no `ds-modal` ancestor to bind. */
    dividers?: boolean;
  };
  banner?: {
    /** Default for every `ds-banner`'s `announce`. Default `false`, because an `alert` region
     *  fires on INSERTION: a banner that is page furniture would interrupt the reader on every
     *  route into the page. Set `true` where banners answer events, and bind `[announce]="false"`
     *  on the furniture. `ds-alert` has its own key. */
    announce?: boolean;
  };
  alert?: {
    /** Default for every `ds-alert`'s `announce`. Default `false`, as `banner.announce`. */
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
    /** Default for `ds-multi-select`'s `searchable`. `true` always shows the panel's filter row,
     *  `false` never, and a NUMBER is a threshold: the row appears once there are at least that
     *  many options. Default `true`. */
    searchable?: boolean | number;
  };

  control?: {
    /** Default `size` for every control on the field-height contract. Default `'md'`.
     *
     *  A different axis from `[data-density]`, which rewrites hit targets and padding in CSS;
     *  this picks which of the three declared sizes a control renders at. */
    size?: DsSize;
  };
  pagination?: {
    /** Default `size` for every pager, `ds-table`'s footer included. Unset falls back to
     *  `control.size`. */
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
    /** Default for `ds-table`'s `stickyScrollbar`, the proxy that keeps the horizontal bar
     *  reachable on a tall table. Default `false`. */
    stickyScrollbar?: boolean;
    /** Default for `ds-table`'s `bordered` (the outer border and radius). Default `false`. */
    bordered?: boolean;
    /** Default for `ds-table`'s `stickyScrollbarOffset`: where the sticky horizontal bar comes to
     *  rest, as any CSS length. Unset, each table measures its own scroll container's bottom
     *  padding and cancels it, which puts the bar on the edge the reader sees. */
    stickyScrollbarOffset?: string;
  };
  icon?: {
    /** Default pixel `size` for `ds-icon`. Default `16`. */
    size?: number;
  };
  badge?: {
    /** Default for `ds-badge`'s `withDot` (the leading status dot). Default `false`. */
    withDot?: boolean;
  };
  chart?: {
    /** Default `dataTable` for all five charts. Default `'none'`: a chart usually sits in a page
     *  that already carries its numbers. It is an accessibility policy, so an app that wants the
     *  annex everywhere sets `'toggle'` here once. */
    dataTable?: ChartDataTable;
    /** Whether every chart draws its own bordered, padded box. Default `'auto'`, which draws it.
     *  An app that puts every chart in a card sets `'none'`. */
    frame?: ChartFrame;
    /** How long every chart's tooltip stays after the pointer leaves the mark, in milliseconds.
     *  Default 500: the pointer crossing to the next mark finds the same panel, which glides there
     *  instead of closing and opening again. Zero takes it away at once. */
    tooltipLingerMs?: number;
    /** Whether a click on a mark, or on a category under the category cursor, holds its tooltip
     *  and highlight in place, for every chart. Default `true`. A held mark shows a pin disc; a
     *  second click, Escape or a press elsewhere lets go. A tap holds whatever this says. */
    pinOnClick?: boolean;
    /** How long the pointer rests on a mark, a category or a legend entry before the chart answers
     *  it - highlight and tooltip alike - in milliseconds. Default 0. Once a chart has answered,
     *  the next mark answers at once until the pointer leaves the chart; focus, a tap and a click
     *  that pins answer at once. */
    hoverDelayMs?: number;
    /** How every chart formats its values, the annex table and the generated description included.
     *  Default groups digits in `locale` and abbreviates on a tick (`1.2M`). */
    valueFormat?: ChartValueFormat;
    /** How charts build themselves on a long page: build each one as it nears the viewport, build
     *  ahead while idle, skip the ones off screen. All off by default. */
    rendering?: ChartRendering;
  };
  datePicker?: {
    /** BCP-47 locale for `ds-date-picker` names and value format. Unset falls back to
     *  `locale`, then `LOCALE_ID`. */
    locale?: string;
    /** Explicit token format, e.g. `'MM/DD/YYYY'`; overrides the locale-derived order. */
    dateFormat?: string;
    /** First weekday column: 0=Sunday to 6=Saturday. Default `1` (Monday). */
    firstDayOfWeek?: number;
  };
}

export const DS_CONFIG = new InjectionToken<DsConfig>('DS_CONFIG', {
  factory: () => ({}),
});

/** Provides DS-level defaults: `providers: [provideDsConfig({ control: { size: 'sm' } })]`.
 *
 * Works at the app root, on a `Route`, or on a component/directive; a subtree can differ from
 * the app. Component inputs (e.g. `<ds-card padding="lg">`) still win.
 *
 * A nested call MERGES with the config above it section by section; only the keys you name are
 * replaced. ONE call per injector: two in the SAME `providers` array both resolve their parent
 * with `skipSelf`, so the later wins and the earlier is silently lost.
 */
export function provideDsConfig(config: DsConfig): Provider {
  return { provide: DS_CONFIG, useFactory: () => inheritDsConfig(config) };
}

/**
 * The factory body behind `provideDsConfig`, exported so a directive can put the provider in
 * its metadata as a plain object literal. Calling `provideDsConfig` there runs at
 * module-evaluation time, making the module side-effectful and costing the consumer its
 * tree-shaking.
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
    const value = own[section];
    Object.assign(merged, {
      [section]:
        typeof value === 'object' && value !== null
          ? { ...(parent[section] as object | undefined), ...value }
          : value,
    });
  }

  return merged;
}
