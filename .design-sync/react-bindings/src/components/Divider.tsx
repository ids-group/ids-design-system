import * as React from 'react';
import { cx, host } from '../lib/util';

export type DividerVariant = 'default' | 'strong' | 'vertical' | 'label';

/**
 * Vertical breathing room around the divider. `md` is the safe default for
 * page-content separators. Use `sm` inside dense lists (sidenav, menus) and
 * `none` when the parent layout already owns the gap.
 */
export type DividerSpacing = 'none' | 'sm' | 'md' | 'lg';

export interface DividerProps {
  /** Rule style — `strong` darker, `vertical` for flex rows, `label` renders
   *  children as an uppercase caption between two rule segments. */
  variant?: DividerVariant;
  /** Vertical margin around the divider. Defaults to `md` (8px) for parity
   *  with menus / sidenavs; bump to `lg` for content-section separators. */
  spacing?: DividerSpacing;
  /** Caption text — only visible with `variant="label"`. */
  children?: React.ReactNode;
}

/** Separator rule — port of `ds-divider`. The host element IS the rule
 *  (role="separator"); `variant="vertical"` needs a flex-row parent
 *  (`align-self: stretch`). */
export function Divider({ variant = 'default', spacing = 'md', children }: DividerProps) {
  return host(
    'ds-divider',
    {
      role: 'separator',
      class:
        cx(
          variant === 'strong' && 'strong',
          variant === 'vertical' && 'vertical',
          variant === 'label' && 'label',
          spacing === 'none' && 'spacing-none',
          spacing === 'sm' && 'spacing-sm',
          spacing === 'md' && 'spacing-md',
          spacing === 'lg' && 'spacing-lg',
        ) || undefined,
      'aria-orientation': variant === 'vertical' ? 'vertical' : undefined,
    },
    children,
  );
}
