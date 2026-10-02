import * as React from 'react';

/**
 * LoadingOverlay — the real LoadingOverlayComponent, run by Angular behind `<ds-x-loading-overlay>`.
 * Region-scoped loading scrim. Wrap the region's content as children; while `loading` is true a translucent scrim with a centred Spinner covers it (rendered inline and absolutely positioned over the children — no portal). The host is `position: relative; display: block` and gets `aria-busy="true"` while loading.
 */
export interface LoadingOverlayProps {
  /** Show the scrim + spinner over the projected region. */
  loading?: boolean;
  /** Optional caption beneath the spinner. */
  label?: string;
  /** Backdrop-blur the projected content behind the scrim. */
  blur?: boolean;
  /** Size of the spinner shown in the scrim. */
  spinnerSize?: ('sm' | 'md' | 'lg');
  /** Offset the scrim top edge, e.g. to keep a sticky header uncovered. */
  insetTop?: string;
  /** Whether the projected content goes `inert` while the scrim is up. On by default, so focus cannot walk under the scrim. Turn it off only when the scrim covers part of the content (`insetTop`) and mark the covered subtree `inert` yourself. */
  inertContent?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const LoadingOverlay: React.ComponentType<LoadingOverlayProps>;
