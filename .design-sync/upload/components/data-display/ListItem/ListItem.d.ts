import * as React from 'react';

/**
 * ListItem — the real ListItemComponent, run by Angular behind `<ds-list-item>`.
 * One row of a `List` (`role="listitem"`) with a leading / body / trailing layout. `title` + `subtitle` cover the common two-line case; richer middle content goes in `children`.
 */
export interface ListItemProps {
  /** Convenience text; richer middle content can be projected as default content. */
  title?: string;
  /** Secondary line below `title`. */
  subtitle?: string;
  /** Makes the row's text a button that emits `activated`. `[leading]` and `[trailing]` stay outside it, so a row can hold its own controls as well. */
  clickable?: boolean;
  /** Marks the row current — `aria-current` and the selected tint. */
  selected?: boolean;
  /** Disables the row's own button. Controls projected into `[leading]` or `[trailing]` keep their own disabled state. */
  disabled?: boolean;
  /** Fires when the clickable row's button is activated. */
  onActivated?: (value: void) => void;
  /** Content for the `[leading]` slot. */
  leading?: React.ReactNode;
  /** Content for the `[trailing]` slot. */
  trailing?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ListItem: React.ComponentType<ListItemProps>;
