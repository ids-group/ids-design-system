import * as React from 'react';

/**
 * Card — the real CardComponent, run by Angular behind `<ds-x-card>`.
 * Content surface (`<article>` inside the host). No named slots — compose header/body/footer freely as children.
 */
export interface CardProps {
  /** `interactive` makes the card clickable and emits `pressed`. Unset falls back to `DS_CONFIG.card.elevation`, then `'flat'`. */
  elevation?: ('flat' | 'raised' | 'hover' | 'interactive') | null;
  /** Inner padding preset. Unset falls back to `DS_CONFIG.card.padding`, then the card's own padding. */
  padding?: ('none' | 'sm' | 'md' | 'lg') | null;
  /** Fires on click when `elevation` is `interactive`. */
  onPressed?: (value: MouseEvent) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Card: React.ComponentType<CardProps>;
