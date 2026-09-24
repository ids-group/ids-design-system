import * as React from 'react';

/**
 * Tag — the real TagComponent, run by Angular behind `<ds-x-tag>`.
 * Label/filter chip. Two fills: `solid` (default, brand accent — high-emphasis selected token) and `neutral` (grey surface + border — low-emphasis metadata).
 */
export interface TagProps {
  /** Fill style — `solid` for high-emphasis, `neutral` for low-emphasis chips. */
  variant?: ('solid' | 'neutral');
  /** Shows a close button that emits `closed`. */
  closable?: boolean;
  /** Makes the tag clickable, emitting `toggled` on click. */
  interactive?: boolean;
  /** Applies the active/selected visual state. */
  selected?: boolean;
  /** Accessible label for the close button (e.g. "Remove Source filter"). Unset falls back to `DS_INTL.tag.remove`. */
  closeLabel?: string | null;
  /** Fires when the close button is clicked. */
  onClosed?: (value: void) => void;
  /** Fires on click when `interactive` is true. */
  onToggled?: (value: void) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Tag: React.ComponentType<TagProps>;
