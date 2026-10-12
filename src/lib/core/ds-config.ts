import { InjectionToken, inject, type Provider } from '@angular/core';
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
  /** BCP-47 locale every component formats numbers and dates in. Default is Angular's
   *  `LOCALE_ID`. A section key that names a locale (`datePicker.locale`) wins over this. */
  locale?: string;
  field?: {
    /** Default for every field's `reserveMessage`. Default `false`. `true` applies to EVERY field
     *  in the injector's subtree; prefer `dsReserveMessages` on the form that validates. */
    reserveMessage?: boolean;
    /** Fallback text per validation-error kind, for validators with no `message` (Angular's
     *  built-ins never carry one). A message on the error itself wins. Unmapped kinds warn in dev. */
    errorMessages?: Record<string, string>;
    /** Leading glyph on a field's message line, per state. Defaults carry one for `error`,
     *  `warning` and `success` (WCAG 1.4.1: not hue alone) and NONE for `hint`. Each key is
     *  independent: a glyph name replaces the default, `false` removes it, and
     *  `stateIcons: false` removes all four. */
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
    /** Display format for `ds-time-picker` - 24h or 12h AM/PM. Unset follows the hour cycle of
     *  `locale` / `LOCALE_ID` (en-US: `'12h'`, en-GB: `'24h'`). */
    format?: '24h' | '12h';
  };
  avatar?: {
    /** How `ds-avatar` turns its `name` into initials, app-wide. The built-in rule takes the
     *  first two words (a Latin-script guess). */
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
  };
  modal?: {
    /** Default for `dividers` on `ds-modal` and `ds-modal-card`. Default `true`. */
    dividers?: boolean;
  };
  banner?: {
    /** Default for every `ds-banner`'s `announce`. Default `false`: an `alert` region fires on
     *  INSERTION, so page-furniture banners would interrupt on every route. Set `true` where banners
     *  answer events, and bind `[announce]="false"` on the furniture. `ds-alert` has its own key. */
    announce?: boolean;
  };
  alert?: {
    /** Default for every `ds-alert`'s `announce`. Default `false`, as `banner.announce`. */
    announce?: boolean;
  };
  toast?: {
    /** Where the stack sits. Merged field by field over the built-in
     *  `right` / `top` / `var(--space-6)`. */
    position?: Partial<DsToastPosition>;
    /** Maximum number of toasts visible at once; extras queue. Default `5`; `0` is unlimited. */
    maxVisible?: number;
    /** Show a `+N` strip while toasts wait behind `maxVisible`. Default `true`. */
    showQueueCount?: boolean;
    /** In dev mode, also show each library warning from the console as a warning toast, once the
     *  app has injected `ToastService`; warnings raised earlier show when it is. Never in a
     *  production build. Default `true`. */
    mirrorDevWarnings?: boolean;
  };
  picker?: {
    /** Default for `ds-multi-select`'s `searchable`. `true` always shows the panel's filter row,
     *  `false` never, and a NUMBER is a threshold: the row appears once there are at least that
     *  many options. Default `true`. */
    searchable?: boolean | number;
  };

  control?: {
    /** Default `size` for every control on the field-height contract. Default `'md'`. A different
     *  axis from `[data-density]`, which rewrites hit targets and padding in CSS. */
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
    /** Default for `ds-table`'s `stickyScrollbar` (keeps the horizontal bar reachable). Default `false`. */
    stickyScrollbar?: boolean;
    /** Default for `ds-table`'s `bordered` (the outer border and radius). Default `false`. */
    bordered?: boolean;
    /** Default for `ds-table`'s `stickyScrollbarOffset`, as any CSS length. Unset, each table
     *  cancels its scroll container's bottom padding. */
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
    /** Default `dataTable` for every chart. Default `'none'`; `'toggle'` offers the annex everywhere. */
    dataTable?: ChartDataTable;
    /** Whether every chart draws its own bordered, padded box. Default `'auto'`, which draws it. */
    frame?: ChartFrame;
    /** How long a chart's tooltip stays after the pointer leaves the mark, in milliseconds.
     *  Default 500; zero closes it at once. */
    tooltipLingerMs?: number;
    /** Whether a click on a mark or category holds its tooltip and highlight. Default `true`.
     *  A second click, Escape or a press elsewhere releases. A tap holds whatever this says. */
    pinOnClick?: boolean;
    /** Milliseconds the pointer rests on a mark, category or legend entry before the chart answers.
     *  Default 0. After one answer the next is immediate until the pointer leaves the chart;
     *  focus, a tap and a pinning click are always immediate. */
    hoverDelayMs?: number;
    /** Whether a chart's tooltip draws a colour dot beside each reading. Unset draws them for two
     *  to four readings. */
    tooltipSwatches?: boolean;
    /** How charts format values, annex table and description included. Default groups digits in
     *  `locale` and abbreviates on a tick (`1.2M`). */
    valueFormat?: ChartValueFormat;
    /** How charts build themselves on a long page. All off by default. */
    rendering?: ChartRendering;
  };
  datePicker?: {
    /** BCP-47 locale for `ds-date-picker` names and value format. Unset falls back to
     *  `locale`, then `LOCALE_ID`. */
    locale?: string;
    /** Explicit token format, e.g. `'MM/DD/YYYY'`; overrides the locale-derived order. */
    dateFormat?: string;
    /** First weekday column: 0=Sunday to 6=Saturday. Unset follows the date picker's locale
     *  (en-US: `0`, en-GB: `1`); `1` (Monday) where the engine has no week data. */
    firstDayOfWeek?: number;
  };
}

export const DS_CONFIG = new InjectionToken<DsConfig>('DS_CONFIG', {
  factory: () => ({}),
});

/** Provides DS-level defaults: `providers: [provideDsConfig({ control: { size: 'sm' } })]`.
 *
 * Works at the app root, on a `Route`, or on a component/directive. Component inputs still win.
 *
 * A nested call MERGES with the config above it section by section; only the keys you name are
 * replaced. Several calls in one `providers` array merge in order, the later winning per key.
 */
export function provideDsConfig(config: DsConfig): Provider {
  return [
    { provide: DS_CONFIG_LAYERS, useValue: config, multi: true },
    { provide: DS_CONFIG, useFactory: mergeDsConfigLayers },
  ];
}

const DS_CONFIG_LAYERS = new InjectionToken<readonly DsConfig[]>(
  'DS_CONFIG_LAYERS',
);

function mergeDsConfigLayers(): DsConfig {
  return inject(DS_CONFIG_LAYERS, { self: true }).reduce(
    mergeDsConfig,
    inject(DS_CONFIG, { skipSelf: true, optional: true }) ?? {},
  );
}

/**
 * The factory body behind `provideDsConfig`, exported so a directive can put the provider in its
 * metadata as an object literal: calling `provideDsConfig` there makes the module side-effectful
 * and defeats tree-shaking.
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
