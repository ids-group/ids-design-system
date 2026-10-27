import * as React from 'react';

/**
 * Button — the real ButtonComponent, run by Angular behind `<ds-x-button>`.
 * Action button with two orthogonal axes: `color` (primary | secondary | tertiary | neutral | error | success | warning) and `variant` (solid | tonal | outline | ghost | text). Default is primary solid. All pairs render, but prefer solid/tonal for success & warning and tonal/outline/ghost for neutral; `variant="text"` is discouraged — use the global `.link` class for link-styled actions.
 */
export interface ButtonProps {
  /** Helper text shown below the control. */
  hint?: string;
  /** Error text. Shown immediately; takes precedence over `errors`. */
  error?: string;
  /** Advisory text, shown when there is no error. */
  warning?: string;
  /** Reserve the message-row height even when empty, so a hint/error does not shift the layout. Unset falls back to `DS_CONFIG.field.reserveMessage` for a field, not for a button. */
  reserveMessage?: boolean | null;
  /** Glyph on the message line, overriding what the state resolves to. Unset follows `DS_CONFIG.field.stateIcons`; `false` removes the glyph here alone. */
  messageIcon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +69 more */ | null;
  /** Brand/status hue family. */
  color?: ('primary' | 'secondary' | 'tertiary' | 'neutral' | 'error' | 'success' | 'warning');
  /** Fill pattern. Every color×variant pair renders; the discouraged ones dev-warn with the reason. Prefer the global `.link` class over `text` unless the ds-button API is needed. */
  variant?: ('solid' | 'tonal' | 'ghost' | 'outline' | 'text');
  /** Where the contents sit once the button is wider than them (`fullWidth`, a stretching grid cell). `'between'` pushes the label and a trailing icon to opposite edges. */
  align?: ('center' | 'between');
  /** Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** `RouterLink` target. Set it and the button renders an `<a [routerLink]>` with `routerLinkActive`, so middle-click, open-in-new-tab and the "link" role work. Accepts a `UrlTree` as well as a path or command array. */
  routerLink?: unknown;
  /** Plain `href` target, used when `routerLink` is not set (external address, download). Renders an `<a href>`. */
  href?: string;
  /** Hash to append to a `routerLink` destination. routerLink-only: on an `href` put it in the URL; on a plain button it is ignored with a dev warning. */
  fragment?: string | undefined;
  /** Query parameters for a `routerLink` destination. routerLink-only. */
  queryParams?: unknown;
  /** How the destination's query merges with the current one. routerLink-only. */
  queryParamsHandling?: unknown;
  /** Browsing context for the link (`'_blank'`, ...). Ignored with a dev warning on a plain button. */
  target?: string | undefined;
  /** `rel` for the link; pair with `target="_blank"` (`noopener` blocks `window.opener` access). */
  rel?: string | undefined;
  /** How `routerLinkActive` decides the `active` class; prefix by default. It also bounds the announcement: with `{ exact: true }` a prefix match announces nothing rather than `true`. Pass `ariaCurrent` alongside to keep one. */
  routerLinkActiveOptions?: unknown;
  /** Overrides what the link announces. Unset, an exact match announces `page` and a prefix match `true`; `null` announces nothing; use `step` or `location` when the link is not a page. */
  ariaCurrent?: ('page' | 'step' | 'location' | 'date' | 'time' | true) | null | undefined;
  /** Native `type`; defaults to `'button'` so it never submits an ancestor form. Button-only: ignored on a link, with a dev warning. */
  type?: ('button' | 'submit' | 'reset');
  /** Disables the button and blocks `pressed`. */
  disabled?: boolean;
  /** Busy state: blocks `pressed` and sets `aria-busy` and `aria-disabled`, keeping the button focusable so focus stays on it while the work runs. Button-only; ignored on an anchor with a dev warning. */
  loading?: boolean;
  /** Where the `loading` spinner draws. `'icon'` puts it in the leading icon's box (the trailing icon's when there is no leading one) and keeps the label visible; `'replace'` hides the contents behind one spinner centred on the button; `'auto'` is `'icon'` when `icon` is set, else `'replace'`. Neither moves the label or resizes the button. */
  loadingMode?: ('auto' | 'icon' | 'replace');
  /** Fills the container: the host becomes block-level and 100% wide. */
  fullWidth?: boolean;
  /** Accessible name, forwarded as `aria-label`. For an icon-only or non-descriptive label. */
  ariaLabel?: string | null;
  /** Icon before the projected content. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +69 more */ | null;
  /** Icon after the projected content. */
  trailingIcon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +69 more */ | null;
  /** `aria-haspopup` on the inner <button>; set when this button triggers an overlay. */
  ariaHasPopup?: 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | null;
  /** `aria-expanded` on the inner <button>; bind to the overlay's open state. */
  ariaExpanded?: boolean | null;
  /** `aria-controls` on the inner <button>: the id of the panel this button opens. */
  ariaControls?: string | null;
  /** Why the button is refused, shown as its second line and read only while `disabled`. Setting it uses `aria-disabled` instead of the native attribute (a native disabled button cannot be focused, so the reason would go unannounced) and swallows the click; a link-button keeps its Tab stop the same way. Uncapped: the text wraps. */
  disabledReason?: string;
  /** `aria-describedby` pointing at a description the app renders itself. Merged with the id of `disabledReason` when both are present. */
  ariaDescribedBy?: string | null;
  /** Fires on click unless `disabled` or `loading`. */
  onPressed?: (value: MouseEvent) => void;
  /** Content for the `[dsButtonSubtext]` slot. */
  subtext?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Button: React.ComponentType<ButtonProps>;
