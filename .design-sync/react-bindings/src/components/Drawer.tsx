import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';
import { Icon } from '../lib/Icon';

export type DrawerSize = 'sm' | 'md' | 'lg';
export type DrawerPlacement = 'right' | 'left' | 'top' | 'bottom';

export interface DrawerProps {
  /** Open state. Controlled when `onOpenChange` is provided; otherwise the
   *  component manages its own state seeded from this value. Defaults to
   *  true (Angular defaults to false) so the panel renders statically. */
  open?: boolean;
  /** Emits the new open state — scrim click, Escape or the close button. */
  onOpenChange?: (open: boolean) => void;
  /** Panel size — sm/md/lg (320/480/640px wide). Applies to right/left
   *  placements; top/bottom span full width. Default 'md'. */
  size?: DrawerSize;
  /** Edge the panel slides in from. Default 'right'. */
  placement?: DrawerPlacement;
  /** Drawer title, shown in the header and used for `aria-labelledby`. */
  title: string;
  /** Fires when the drawer is dismissed. Angular fires this after the
   *  slide-out animation; inline there is none, so it fires immediately. */
  onClosed?: () => void;
  /** Panel content (the `[drawer-body]` slot). */
  children?: React.ReactNode;
  /** Footer action buttons (the `[drawer-footer]` slot). NOTE: the footer
   *  strip (padding + top border) renders even when empty — same as Angular. */
  footer?: React.ReactNode;
}

/** Edge-anchored slide-in panel — port of `ds-drawer`. Renders INLINE (no
 *  portal): `.drawer-root` is `position: fixed; inset: 0` with the scrim and
 *  panel absolutely positioned inside it, so it covers the viewport unless an
 *  ancestor forms a containing block (transform/filter/contain) — wrap
 *  previews in one sized like a mini viewport. There is no static-preview
 *  branch in the DS for this component. Focus trap, body scroll lock,
 *  document-level Escape and the slide animations are not reproduced
 *  (Escape works while focus is inside the panel). */
export function Drawer({
  open,
  onOpenChange,
  size = 'md',
  placement = 'right',
  title,
  onClosed,
  children,
  footer,
}: DrawerProps) {
  const [titleId] = React.useState(() => nextControlId('ds-drawer-title'));
  const [ownOpen, setOwnOpen] = React.useState(open ?? true);
  const isOpen = onOpenChange ? (open ?? true) : ownOpen;
  const setOpen = (next: boolean) => {
    if (!onOpenChange) setOwnOpen(next);
    onOpenChange?.(next);
  };

  const close = () => {
    setOpen(false);
    onClosed?.();
  };

  return host(
    'ds-drawer',
    null,
    isOpen && (
      <div className="drawer-root">
        <div className="drawer-scrim" onClick={close} />

        <div
          role="dialog"
          aria-modal="true"
          className={cx('drawer', placement, size)}
          aria-labelledby={title ? titleId : undefined}
          onKeyDown={(e) => {
            if (e.key === 'Escape') close();
          }}
        >
          <header className="header">
            <h4 className="title" id={titleId}>{title}</h4>

            <button type="button" className="close" aria-label="Close" onClick={close}>
              <Icon name="x" size={16} />
            </button>
          </header>

          <div className="body">{children}</div>

          <div className="footer">{footer}</div>
        </div>
      </div>
    ),
  );
}
