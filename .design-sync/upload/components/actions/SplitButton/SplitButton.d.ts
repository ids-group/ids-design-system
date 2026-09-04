import * as React from 'react';

/**
 * SplitButton — the real SplitButtonComponent, run by Angular behind `<ds-split-button>`.
 * Main action button + chevron dropdown trigger fused into one control. The main button fires `onPressed` immediately; the chevron opens a menu of alternative actions (`menuItems`) and `onItemSelected` fires with the chosen item (which also closes the menu). Two visual styles via `variant`: `primary` (solid accent, default) and `outline` (use when it sits alongside a primary action).
 */
export interface SplitButtonProps {
  /** Label text on the main button. */
  label?: string;
  /** Visual style — primary (solid) or outline. */
  variant?: ('primary' | 'outline');
  /** Icon shown on the main button, before the label. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** Disables both the main button and the dropdown trigger. */
  disabled?: boolean;
  /** Items listed in the dropdown menu. Empty disables the chevron. */
  menuItems?: unknown;
  /** Accessible name for the dropdown trigger. */
  menuLabel?: string;
  /** Fires when the main button (not the dropdown trigger) is clicked. */
  onPressed?: (value: MouseEvent) => void;
  /** Fires with the chosen menu item. */
  onItemSelected?: (value: unknown) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const SplitButton: React.ComponentType<SplitButtonProps>;
