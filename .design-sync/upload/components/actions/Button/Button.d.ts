import * as React from 'react';

/**
 * Button — the real ButtonComponent, run by Angular behind `<ds-x-button>`.
 * Action button with two orthogonal axes: `color` (primary | secondary | tertiary | neutral | error | success | warning) and `variant` (solid | tonal | outline | ghost | text). Default is primary solid. All pairs render, but prefer solid/tonal for success & warning and tonal/outline/ghost for neutral; `variant="text"` is discouraged — use the global `.link` class for link-styled actions.
 */
export interface ButtonProps {
  /** Helper text shown below the control. */
  hint?: string;
  /** Error text. Shown immediately — binding it says the consumer has already decided this is in error. Takes precedence over `errors`. */
  error?: string;
  /** Advisory text, shown when there is no error. */
  warning?: string;
  /** Reserve the message-row height even when empty, so the control doesn't shift the layout below it when a hint/error appears. Falls back to `DS_CONFIG.field.reserveMessage`, then off. */
  reserveMessage?: boolean | null;
  /** Glyph on the message line, overriding what the state resolves to. Unset follows `DS_CONFIG.field.stateIcons`; `false` removes the glyph here alone. */
  messageIcon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** Brand/status hue family. */
  color?: ('primary' | 'secondary' | 'tertiary' | 'neutral' | 'error' | 'success' | 'warning');
  /** Fill pattern. Every color×variant pair renders; the discouraged ones dev-warn with the reason. `text` is discouraged for every colour — prefer the global `.link` class, and keep this one only where the ds-button API is needed. */
  variant?: ('solid' | 'tonal' | 'ghost' | 'outline' | 'text');
  /** Button height — sm/md/lg. Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** `RouterLink` target. Set it and the button renders an `<a [routerLink]>` with `routerLinkActive`: middle-click, open-in-new-tab and the announced "link" role depend on the element, not on the look. Accepts a `UrlTree` as well as a path or a command array — `Router.createUrlTree` is the way to reach the `UrlCreationOptions` that have no input of their own here (`relativeTo`, `preserveFragment`). */
  routerLink?: unknown;
  /** Plain `href` target, used when `routerLink` is not set — an external address or a download. Renders an `<a href>`; same reasoning as `routerLink`. */
  href?: string;
  /** Hash to append to a `routerLink` destination — the section of the page to land on. routerLink-only: on an `href` put it in the URL, and on a plain button it is ignored with a dev warning. */
  fragment?: string | undefined;
  /** Query parameters for a `routerLink` destination. routerLink-only, same as `fragment`. */
  queryParams?: unknown;
  /** How the destination's query merges with the current one — `'merge'`, `'preserve'` or `'replace'`. routerLink-only. */
  queryParamsHandling?: unknown;
  /** Browsing context for the link — `'_blank'` and the rest. Both link destinations take it; on a plain button it is ignored with a dev warning. */
  target?: string | undefined;
  /** `rel` for the link. Pair it with `target="_blank"`: without `noopener` the opened page can reach back through `window.opener`. Both link destinations take it. */
  rel?: string | undefined;
  /** How `routerLinkActive` decides the `active` CLASS — prefix by default, so a section link stays lit inside its own pages. It also bounds the announcement, because the same directive writes it: narrowed to `{ exact: true }`, a prefix match is no longer active and the link announces nothing rather than `true`. Pass `ariaCurrent` alongside to keep one. */
  routerLinkActiveOptions?: unknown;
  /** Overrides what the link announces. Unset, an exact match announces `page` and a prefix match announces `true`, which is what ARIA means by each; pass `null` to announce nothing, or one of the other values when the link is a step or a location rather than a page. */
  ariaCurrent?: ('page' | 'step' | 'location' | 'date' | 'time' | true) | null | undefined;
  /** Native `type`, defaulting to `'button'` so it never submits an ancestor form by accident. Button-only: ignored on a link, with a dev warning. */
  type?: ('button' | 'submit' | 'reset');
  /** Disables the button and blocks `pressed`. */
  disabled?: boolean;
  /** Busy state — disables interaction and sets `aria-busy`. Button-only: a navigation cannot be in flight before it starts, so on an anchor it is ignored with a dev-mode warning. */
  loading?: boolean;
  /** Stretch to fill the container: the host becomes block-level and 100% wide. */
  fullWidth?: boolean;
  /** Accessible name, forwarded as `aria-label`. For an icon-only or non-descriptive label. */
  ariaLabel?: string | null;
  /** Leading icon, before the projected content. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** Trailing icon, after the projected content. */
  trailingIcon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** ARIA `aria-haspopup`, forwarded to the inner <button> — set when this button triggers a menu/dialog/listbox overlay. */
  ariaHasPopup?: 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | null;
  /** ARIA `aria-expanded`, forwarded to the inner <button> — bind to the overlay's open state on a trigger button. */
  ariaExpanded?: boolean | null;
  /** ARIA `aria-controls`, forwarded to the inner <button> — the id of the panel this button opens, e.g. `ds-app-layout`'s `railId`. */
  ariaControls?: string | null;
  /** Why the button is refused, shown as its second line and read only while `disabled`. Setting it also changes HOW the button is disabled — `aria-disabled` instead of the native attribute, because a natively disabled button cannot be focused and the reason would never be announced, so the click is swallowed in `onClick` instead. Uncapped: the text wraps and the button grows. Same name and meaning as `TableRowAction.disabledReason`. */
  disabledReason?: string;
  /** ARIA `aria-describedby` — point the button at a description the app renders itself, such as a `ds-field-message` under a form. Merged with the id of `disabledReason` when both are present. */
  ariaDescribedBy?: string | null;
  /** Fires on click, unless `disabled` or `loading`. */
  onPressed?: (value: MouseEvent) => void;
  /** Content for the `[dsButtonSubtext]` slot. */
  subtext?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Button: React.ComponentType<ButtonProps>;
