import * as React from 'react';

/**
 * BottomSheet — the real BottomSheetComponent, run by Angular behind `<ds-x-bottom-sheet>`.
 * Bottom-anchored sheet, the mobile sibling of Drawer — port of `ds-bottom-sheet`. Renders INLINE (no portal): `.sheet-overlay` is the scrim itself at `position: fixed; inset: 0` (flex, panel pushed to the bottom edge), so it covers the viewport unless an ancestor forms a containing block (`transform`, `filter` or `contain`) — wrap contained specimens in one sized like a mini viewport. On wide viewports the panel caps at `--ds-bottom-sheet-maxw` (480px) and centres.
 */
export interface BottomSheetProps {
  /** Open state, two-way bound. */
  open?: boolean;
  onOpenChange?: (value: boolean) => void;
  /** Sheet title, shown in the header and used for `aria-labelledby`. */
  title?: string;
  /** Fires once the close (leave) animation finishes. */
  onClosed?: (value: void) => void;
  /** Snap-point heights as fractions of viewport height (0-1), ascending, e.g. [0.4, 0.9]. The sheet opens at the first snap point; dragging snaps to the nearest point; dragging below the lowest closes. Empty (default) means a single height. */
  snapPoints?: readonly number[];
  staticPreview?: boolean;
  /** Content for the `[actions]` slot. */
  actions?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const BottomSheet: React.ComponentType<BottomSheetProps>;
