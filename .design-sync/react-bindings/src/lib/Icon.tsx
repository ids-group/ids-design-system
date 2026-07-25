import * as React from 'react';
import { ICONS, type IconName } from './icons.gen';
import { host } from './util';

export type { IconName };

export interface IconProps {
  /** Icon name from the DS's built-in inline SVG set. */
  name: IconName;
  /** Square size in px. Default 16. */
  size?: number;
  /** SVG stroke width. Default 1.75. */
  stroke?: number;
  /** When set, the icon is exposed to assistive tech as an image with this
   *  name; otherwise it is decorative and hidden (`aria-hidden`). */
  ariaLabel?: string | null;
  /** Class(es) applied to the `ds-icon` host — mirrors Angular templates that
   *  put scoped classes on the icon host element. */
  className?: string;
  /** Inline style on the `ds-icon` host. */
  style?: React.CSSProperties;
}

/** Inline SVG icon — port of `ds-icon` (ViewEncapsulation.None; all styling
 *  comes from the global `_icon-base.scss` layer + `stroke: currentColor`). */
export function Icon({ name, size = 16, stroke = 1.75, ariaLabel = null, className, style }: IconProps) {
  return host(
    'ds-icon',
    { class: className, style },
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ ['--ds-icon-size' as string]: `${size}px` }}
      width={size}
      height={size}
      strokeWidth={stroke}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel ?? undefined}
      aria-hidden={ariaLabel ? undefined : 'true'}
      dangerouslySetInnerHTML={{ __html: (ICONS as Record<string, string>)[name] ?? '' }}
    />,
  );
}
