import * as React from 'react';
import { host } from '../lib/util';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

let nextTipId = 0;

export interface TooltipPanelProps {
  /** Tooltip text content. */
  text: string;
  /** Side of the trigger the panel is positioned on; also drives the arrow class. */
  placement: TooltipPlacement;
  /** Element `id`, referenced by the trigger's `aria-describedby`. */
  panelId?: string;
  /** Layout glue (positioning) applied to the `ds-tooltip-panel` host. */
  style?: React.CSSProperties;
}

/** Bare dark tooltip pill — port of `ds-tooltip-panel`. The host IS the
 *  popover; the placement class only sets the arrow direction (positioning is
 *  the consumer's job — in Angular the CDK overlay's, here `Tooltip`'s). */
export function TooltipPanel({ text, placement, panelId = '', style }: TooltipPanelProps) {
  return host(
    'ds-tooltip-panel',
    {
      role: 'tooltip',
      id: panelId || undefined,
      class: placement,
      style,
    },
    text,
  );
}

export interface TooltipProps {
  /** Tooltip text (the `[dsTooltip]` value). Empty → the tooltip never shows. */
  text: string;
  /** Side of the trigger the panel appears on. Default 'top'. */
  placement?: TooltipPlacement;
  /** Hover intent delay in ms before showing (the `dsTooltipDelay` input). Default 120. */
  delay?: number;
  /** Force the panel visible — for static open-state rendering. Hover/focus
   *  still shows the panel when this is omitted or false. */
  open?: boolean;
  /** The trigger element the tooltip describes. A single React element also
   *  receives `aria-describedby` while the panel is visible. */
  children: React.ReactNode;
}

/** Positioning glue replacing the Angular CDK overlay: the panel is absolutely
 *  positioned against the trigger wrapper, 8px off the chosen side (the same
 *  offset the `[dsTooltip]` directive passes to the CDK). */
const PANEL_POSITION: Record<TooltipPlacement, React.CSSProperties> = {
  top: { position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', width: 'max-content' },
  bottom: { position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', width: 'max-content' },
  left: { position: 'absolute', right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)', width: 'max-content' },
  right: { position: 'absolute', left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)', width: 'max-content' },
};

/** Hover/focus tooltip — port of the `[dsTooltip]` directive. Angular attaches
 *  a portaled `ds-tooltip-panel` to the decorated element; this binding wraps
 *  the trigger in a relatively-positioned span and renders the panel INLINE
 *  (no portal), absolutely positioned on the `placement` side. */
export function Tooltip({ text, placement = 'top', delay = 120, open, children }: TooltipProps) {
  const [tipId] = React.useState(() => `ds-tooltip-${++nextTipId}`);
  const [hoverOpen, setHoverOpen] = React.useState(false);
  const timer = React.useRef<number | null>(null);

  const clear = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };
  React.useEffect(() => clear, []);

  const show = () => {
    if (!text) return;
    clear();
    timer.current = window.setTimeout(() => setHoverOpen(true), delay);
  };
  const hide = () => {
    clear();
    setHoverOpen(false);
  };

  const isOpen = !!text && ((open ?? false) || hoverOpen);

  // The Angular directive sets aria-describedby on the trigger while shown.
  const trigger =
    isOpen && React.isValidElement(children)
      ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
          'aria-describedby': tipId,
        })
      : children;

  return (
    <span
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(e) => {
        if (e.key === 'Escape') hide();
      }}
    >
      {trigger}
      {isOpen && (
        <TooltipPanel text={text} placement={placement} panelId={tipId} style={PANEL_POSITION[placement]} />
      )}
    </span>
  );
}
