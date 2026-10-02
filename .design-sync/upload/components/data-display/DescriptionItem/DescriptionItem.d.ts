import * as React from 'react';

/**
 * DescriptionItem — the real DescriptionItemComponent, run by Angular behind `<ds-description-item>`.
 * One term/detail pair inside a `DescriptionList` (`role="group"` with a `role="term"` label and `role="definition"` value). Layout (side-by-side vs stacked) follows the parent list's `orientation` — don't set it here.
 */
export interface DescriptionItemProps {
  /** The label, plain text. Rich values go in the projected content. */
  term?: string;
  /** When set, a copy button copies this string to the clipboard. */
  copyValue?: string | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const DescriptionItem: React.ComponentType<DescriptionItemProps>;
