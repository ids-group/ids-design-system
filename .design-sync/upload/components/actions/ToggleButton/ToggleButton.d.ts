import * as React from 'react';

/**
 * ToggleButton — the real ToggleButtonComponent, run by Angular behind `<ds-toggle-button>`.
 * Standalone binary on/off toggle button with a projected label and optional leading icon. Sets `aria-pressed` from its state. Distinct from Segmented (one-of-many value toggle) and from IconButton's `selected` (icon-only toggle) — this is a labelled on/off control (e.g. "Show completed", filter chips in a toolbar).
 */
export interface ToggleButtonProps {
  /** Pressed (on/off) state; two-way bound. */
  pressed?: boolean;
  onPressedChange?: (value: boolean) => void;
  /** Optional leading icon name. */
  icon?: string;
  /** Disables the toggle. */
  disabled?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ToggleButton: React.ComponentType<ToggleButtonProps>;
