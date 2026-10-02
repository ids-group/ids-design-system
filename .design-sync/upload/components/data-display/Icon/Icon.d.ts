import * as React from 'react';

/**
 * Icon — the real IconComponent, run by Angular behind `<ds-x-icon>`.
 * Inline stroke icon from the built-in 85-name set (24×24 viewBox, `stroke: currentColor`, weight 1.75). Decorative by default (`aria-hidden`); pass `ariaLabel` to expose it as an image. `size` in px (default 16), `stroke` overrides weight.
 */
export interface IconProps {
  name?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +69 more */;
  /** Pixel size of the square glyph. Unset falls back to `DS_CONFIG.icon.size`, then `16`. */
  size?: number | null;
  stroke?: number;
  /** When set, the icon is exposed to assistive tech as an image with this name; otherwise it is decorative and hidden (`aria-hidden`). */
  ariaLabel?: string | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Icon: React.ComponentType<IconProps>;
