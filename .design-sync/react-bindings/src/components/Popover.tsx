import * as React from 'react';
import { cx, host } from '../lib/util';

export type PopoverAlign = 'start' | 'end';
export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface PopoverProps {
  /** Cross-axis alignment of the panel against the trigger. In Angular this
   *  feeds the CDK position strategy; the inline render keeps it for API
   *  parity only (no visual effect without a portal). */
  align?: PopoverAlign;
  /** Which side of the trigger the panel prefers to appear on. Drives the
   *  arrow direction (via `data-placement`) when `arrow` is set. */
  placement?: PopoverPlacement;
  /** Render a small caret pointing at the trigger. */
  arrow?: boolean;
  /** ARIA role for the panel (e.g. 'dialog' for interactive popovers).
   *  Leave null for plain, non-interactive text popovers. */
  panelRole?: string | null;
  /** Accessible name for the panel; pair with `panelRole`. */
  panelLabel?: string | null;
  /** Open state. Defaults to true — this binding is the PANEL only (the
   *  trigger is the consumer's), so it renders visible out of the box.
   *  The panel renders INLINE inside the host (no portal). */
  open?: boolean;
  /** Panel content. A `Menu` child gets its frame dropped and the panel's
   *  padding removed by the DS CSS automatically. */
  children?: React.ReactNode;
}

/** Light surface overlay panel — port of `ds-popover`. In Angular the panel is
 *  portaled next to a trigger passed to `toggle(trigger)`; this binding renders
 *  the same `.popover` markup INLINE inside the `ds-popover` host (which is
 *  `display: contents`), matching the component's own static-preview branch.
 *  Bind `aria-expanded`/`aria-haspopup` on your trigger yourself. */
export function Popover({
  align = 'start',
  placement = 'bottom',
  arrow = false,
  panelRole = null,
  panelLabel = null,
  open = true,
  children,
}: PopoverProps) {
  // `align` intentionally unused inline — kept so consumer code ports 1:1.
  void align;

  return host(
    'ds-popover',
    null,
    open && (
      <div
        className={cx('popover', arrow && 'has-arrow')}
        role={panelRole ?? undefined}
        aria-label={panelLabel ?? undefined}
        data-placement={arrow ? placement : undefined}
      >
        {arrow && <span className="arrow" />}
        {children}
      </div>
    ),
  );
}
