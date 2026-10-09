import * as React from 'react';

/**
 * TooltipPanel — the real TooltipPanelComponent, run by Angular behind `<ds-tooltip-panel>`.
 * Bare tooltip pill — port of `ds-tooltip-panel`, the dark surface `Tooltip` positions for you. Use directly only for static specimens (style guides, previews) where you place it yourself; product code should use `Tooltip`.
 */
export interface TooltipPanelProps {
  /** Tooltip text; `**bold**` runs render bold. */
  text?: string;
  /** Side of the trigger the panel is positioned on; also drives the arrow class. */
  placement?: ('top' | 'bottom' | 'left' | 'right');
  /** Whether the arrow pointing at the trigger is drawn. */
  arrow?: boolean;
  /** Element `id`, referenced by the trigger's `aria-describedby`. */
  panelId?: string;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const TooltipPanel: React.ComponentType<TooltipPanelProps>;
