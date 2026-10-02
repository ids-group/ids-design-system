import * as React from 'react';

/**
 * SplitButton — the real SplitButtonComponent, run by Angular behind `<ds-split-button>`.
 * Main action button + chevron dropdown trigger fused into one control. The main button fires `onPressed` immediately; the chevron opens a menu of alternative actions (`menuItems`) and `onItemSelected` fires with the chosen item (which also closes the menu). Two visual styles via `variant`: `primary` (solid accent, default) and `outline` (use when it sits alongside a primary action).
 */
export interface SplitButtonProps {
  /** Label text on the main button. */
  label?: string;
  /** Visual style - primary (solid) or outline. */
  variant?: ('primary' | 'outline');
  /** Icon before the label on the main button. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +69 more */ | null;
  /** Disables the main button and the dropdown trigger. */
  disabled?: boolean;
  /** Items listed in the dropdown menu. Empty disables the chevron. */
  menuItems?: unknown;
  /** Accessible name of the dropdown trigger. Unset falls back to `DS_INTL.splitButton.menuLabel`. */
  menuLabel?: string | null;
  /** Fires on a click of the main button, not the dropdown trigger. */
  onPressed?: (value: MouseEvent) => void;
  /** Fires for a menu item only; the main button emits `pressed`. */
  onItemSelected?: (value: unknown) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const SplitButton: React.ComponentType<SplitButtonProps>;
