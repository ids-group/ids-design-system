import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';

export interface BottomSheetProps {
  /** Open state. Controlled when `onOpenChange` is provided; otherwise the
   *  component manages its own state seeded from this value. Defaults to
   *  true (Angular defaults to false) so the sheet renders statically. */
  open?: boolean;
  /** Emits the new open state — scrim tap or Escape. */
  onOpenChange?: (open: boolean) => void;
  /** Sheet title, shown in the header and used for `aria-labelledby`. */
  title: string;
  /**
   * Snap-point heights as fractions of viewport height (0–1), ascending.
   * e.g. [0.4, 0.9]. When provided the sheet's height is pinned to the active
   * snap point. When empty (default) the sheet sizes to content (capped at
   * `--ds-bottom-sheet-maxh`, default 80%).
   */
  snapPoints?: readonly number[];
  /** Which snap point is active (index into `snapPoints`). Binding-only prop:
   *  in Angular the index is driven by dragging the grab strip, which is not
   *  reproduced inline. Default 0 (Angular opens at the first snap point). */
  activeSnapIndex?: number;
  /** Fires when the sheet is dismissed. Angular fires this after the
   *  slide-down animation; inline there is none, so it fires immediately. */
  onClosed?: () => void;
  /** Sheet content (the default slot). */
  children?: React.ReactNode;
  /** Footer buttons, stacked vertically (the `[actions]` slot). */
  actions?: React.ReactNode;
}

/** Bottom-anchored sheet — the mobile sibling of Drawer; port of
 *  `ds-bottom-sheet`. Renders INLINE (no portal): `.sheet-overlay` is the
 *  scrim itself at `position: fixed; inset: 0`, so it covers the viewport
 *  unless an ancestor forms a containing block (transform/filter/contain) —
 *  wrap previews in one sized like a mini viewport. On wide viewports the
 *  panel is capped at `--ds-bottom-sheet-maxw` (480px) and centred. The grab
 *  strip renders but drag-to-dismiss/drag-to-snap, focus trap, body scroll
 *  lock and the slide animations are not reproduced (scrim click and Escape
 *  still close). There is no static-preview branch in the DS for this
 *  component. */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  snapPoints = [],
  activeSnapIndex = 0,
  onClosed,
  children,
  actions,
}: BottomSheetProps) {
  const [titleId] = React.useState(() => nextControlId('ds-bottom-sheet-title'));
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

  const snapHeight =
    snapPoints.length > 0
      ? `${snapPoints[Math.min(activeSnapIndex, snapPoints.length - 1)] * 100}vh`
      : null;

  return host(
    'ds-bottom-sheet',
    null,
    isOpen && (
      <div
        className="sheet-overlay"
        onClick={close}
        onKeyDown={(e) => {
          if (e.key === 'Escape') close();
        }}
      >
        <div
          className={cx('sheet', snapPoints.length > 0 && 'snapping')}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          style={snapHeight ? { height: snapHeight, maxHeight: snapHeight } : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grab">
            <div className="sheet-handle" />
          </div>

          {title && (
            <h3 className="sheet-title" id={titleId}>{title}</h3>
          )}

          <div className="sheet-body">{children}</div>

          <div className="sheet-actions">{actions}</div>
        </div>
      </div>
    ),
  );
}
