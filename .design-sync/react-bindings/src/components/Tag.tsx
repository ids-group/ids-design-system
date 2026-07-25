import * as React from 'react';
import { cx, host } from '../lib/util';
import { Icon } from '../lib/Icon';

/** solid — brand fill (high-emphasis selected token / active label);
 *  neutral — surface-secondary fill + divider border (low-emphasis metadata / filter chip). */
export type TagVariant = 'solid' | 'neutral';

export interface TagProps {
  /** Fill style — `solid` for high-emphasis, `neutral` for low-emphasis chips. */
  variant?: TagVariant;
  /** Shows a close button that emits `onClosed`. */
  closable?: boolean;
  /** Makes the tag clickable, emitting `onToggled` on click. */
  interactive?: boolean;
  /** Applies the active/selected visual state. */
  selected?: boolean;
  /** Accessible label for the close button (e.g. "Remove Source filter"). */
  closeLabel?: string;
  /** Tag label content. */
  children?: React.ReactNode;
  /** Fires when the close button is clicked. */
  onClosed?: () => void;
  /** Fires on click when `interactive` is true. */
  onToggled?: () => void;
}

/** Label/filter chip — port of `ds-tag`. `closable` adds a × button;
 *  `interactive` + `selected` make it a toggleable filter chip. */
export function Tag({
  variant = 'solid',
  closable = false,
  interactive = false,
  selected = false,
  closeLabel = 'Remove',
  children,
  onClosed,
  onToggled,
}: TagProps) {
  return host(
    'ds-tag',
    {
      class:
        cx(
          variant === 'neutral' && 'neutral',
          closable && 'closable',
          interactive && 'interactive',
          selected && 'is-active',
        ) || undefined,
      onClick: () => {
        if (interactive) onToggled?.();
      },
    },
    children,
    closable && (
      <button
        key="close"
        type="button"
        className="close"
        aria-label={closeLabel}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onClosed?.();
        }}
      >
        <Icon name="x" size={12} />
      </button>
    ),
  );
}
