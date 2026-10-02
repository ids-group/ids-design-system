import * as React from 'react';

/**
 * W3w — the real W3wComponent, run by Angular behind `<ds-w3w>`.
 * what3words pill (`ds-w3w`) — displays a three-word location identifier (`///daring.lion.race`) as a monospace, brand-coloured token with a map icon; the `///` prefix mark is danger-red. Not a text input: it is a read-only, click-to-copy display chip that sits with badges/tags as a pill-family component.
 */
export interface W3wProps {
  /** Marker before the address. */
  prefix?: string;
  /** The three-word address, rendered after `prefix`. */
  address?: string;
  /** Makes the address clickable/focusable and copies `prefix` + `address` to the clipboard. */
  copyable?: boolean;
  /** Fires with `address` after a successful copy. */
  onCopied?: (value: string) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const W3w: React.ComponentType<W3wProps>;
