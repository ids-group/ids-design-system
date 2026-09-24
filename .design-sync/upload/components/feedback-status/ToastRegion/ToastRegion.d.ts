import * as React from 'react';

/**
 * ToastRegion — the real ToastRegionComponent, run by Angular behind `<ds-x-toast-region>`.
 * Vertical stack of toasts. It renders one `Toast` per live entry inside a labelled `role="region"`, newest nearest the anchor, and the service owns what is in it.
 */
export interface ToastRegionProps {
  /** Cap on concurrently visible toasts. Extras are queued and shown as earlier ones dismiss. `0` = unlimited. */
  maxVisible?: number;
  /** Show a `+N` strip while toasts wait behind `maxVisible`. */
  showQueueCount?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ToastRegion: React.ComponentType<ToastRegionProps>;
