import * as React from 'react';

/**
 * Popover — the real PopoverComponent, run by Angular behind `<ds-x-popover>`.
 * Light surface overlay panel — port of `ds-popover`. This binding is the PANEL only: the trigger button is yours (bind `aria-haspopup`/`aria-expanded` on it and toggle `open`). The panel renders INLINE inside the host (no portal), so it flows where you place it rather than floating over the page.
 */
export interface PopoverProps {
  /** Cross-axis alignment of the panel against the trigger. */
  align?: ('start' | 'end');
  /** Which side of the trigger the panel prefers to appear on. */
  placement?: ('top' | 'bottom' | 'left' | 'right');
  /** Render a small caret pointing at the trigger. */
  arrow?: boolean;
  /** ARIA role for the panel (e.g. 'dialog' for interactive popovers). When set, the panel traps focus and captures it on open; a keyboard (Escape) or in-panel close returns focus to the trigger, while an outside click or scroll leaves focus where it lands (non-modal). Leave null for plain, non-interactive text popovers. */
  panelRole?: string | null;
  /** Accessible name for the panel; pair with `panelRole`. */
  panelLabel?: string | null;
  staticPreview?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Popover: React.ComponentType<PopoverProps>;
