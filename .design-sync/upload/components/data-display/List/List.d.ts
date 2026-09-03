import * as React from 'react';

/**
 * List — the real ListComponent, run by Angular behind `<ds-list>`.
 * Vertical stack of `ListItem` rows, rendered as `role="list"`. Purely structural — no border of its own, so it drops straight into a `Card`.
 */
export interface ListProps {
  /** Draw a hairline separator between adjacent items. */
  dividers?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const List: React.ComponentType<ListProps>;
