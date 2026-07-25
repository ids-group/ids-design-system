import * as React from 'react';
import { cx, host } from '../lib/util';

export type CardElevation = 'flat' | 'raised' | 'hover' | 'interactive';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  /** Visual treatment; `interactive` makes the card clickable and emits `onPressed`. */
  elevation?: CardElevation;
  /** Inner padding preset; `null` keeps the card's default padding. */
  padding?: CardPadding | null;
  /** Card content. */
  children?: React.ReactNode;
  /** Fires the click event when `elevation` is `interactive`. */
  onPressed?: (event: React.MouseEvent<HTMLElement>) => void;
}

/** Content surface — port of `ds-card`. Renders an `<article>` inside the
 *  host; when `elevation="interactive"` it becomes a keyboard-activatable
 *  button-role element. */
export function Card({
  elevation = 'flat',
  padding = null,
  children,
  onPressed,
}: CardProps) {
  const interactive = elevation === 'interactive';
  const classes = cx('card', elevation, padding && `padding-${padding}`);

  return host(
    'ds-card',
    null,
    <article
      className={classes}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={(e) => {
        if (interactive) onPressed?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.currentTarget.click();
        }
      }}
    >
      {children}
    </article>,
  );
}
