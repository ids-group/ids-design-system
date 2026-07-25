import * as React from 'react';
import { cx, host } from '../lib/util';

export interface ListProps {
  /** Draw a hairline separator between adjacent items. Default true. */
  dividers?: boolean;
  /** The `ListItem` children. */
  children?: React.ReactNode;
}

/** Vertical stack of rows — port of `ds-list`. Renders as `role="list"`;
 *  the `dividers` host class draws a border between adjacent `ListItem`
 *  children (the compiled CSS pierces from the list host to the items). */
export function List({ dividers = true, children }: ListProps) {
  return host(
    'ds-list',
    {
      role: 'list',
      class: cx(dividers && 'dividers') || undefined,
    },
    children,
  );
}

export interface ListItemProps {
  /** Convenience text; richer middle content can be passed as `children`. */
  title?: string;
  /** Secondary line below `title`. */
  subtitle?: string;
  /** Whole-row navigation: renders an inner button and emits `onActivated`. */
  clickable?: boolean;
  /** Marks the row current via `aria-current` (on the button when `clickable`). */
  selected?: boolean;
  /** Disables the row; only affects the button when `clickable`. */
  disabled?: boolean;
  /** Leading content (the `[leading]` slot) — avatar, icon, status dot. */
  leading?: React.ReactNode;
  /** Trailing content (the `[trailing]` slot) — badge, chevron, actions. */
  trailing?: React.ReactNode;
  /** Extra middle content rendered below `title`/`subtitle`. */
  children?: React.ReactNode;
  /** Fires when the clickable row's button is activated. */
  onActivated?: () => void;
}

/** One row of a `List` — port of `ds-list-item`. Renders as `role="listitem"`
 *  with a leading / body / trailing layout; `clickable` swaps the inner
 *  wrapper for a full-row button. */
export function ListItem({
  title = '',
  subtitle = '',
  clickable = false,
  selected = false,
  disabled = false,
  leading,
  trailing,
  children,
  onActivated,
}: ListItemProps) {
  const content = (
    <>
      <span className="leading">{leading}</span>

      <span className="body">
        {title && <span className="title">{title}</span>}

        {subtitle && <span className="subtitle">{subtitle}</span>}

        {children}
      </span>

      <span className="trailing">{trailing}</span>
    </>
  );

  return host(
    'ds-list-item',
    {
      role: 'listitem',
      class:
        cx(clickable && 'clickable', selected && 'selected', disabled && 'disabled') || undefined,
    },
    clickable ? (
      <button
        type="button"
        className="activator"
        disabled={disabled}
        aria-current={selected ? 'true' : undefined}
        onClick={() => onActivated?.()}
      >
        {content}
      </button>
    ) : (
      <div className="activator">{content}</div>
    ),
  );
}
