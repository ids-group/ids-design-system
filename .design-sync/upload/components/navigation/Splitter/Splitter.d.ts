import * as React from 'react';

/**
 * Splitter — the real SplitterComponent, run by Angular behind `<ds-splitter>`.
 * Two panes with a handle between them that resizes one of them (`ds-splitter`). Give it a height, a fixed one or from a flex or grid parent; the panes fill it.
 */
export interface SplitterProps {
  /** `'horizontal'`: panes side by side. `'vertical'`: panes stacked. */
  orientation?: ('horizontal' | 'vertical');
  /** The pane `size` measures; the other pane takes the rest. */
  pane?: ('start' | 'end');
  /** Size of `pane` in px, two-way bound; `null` shows `defaultSize`. A drag writes it once, on release. */
  size?: number | null;
  onSizeChange?: (value: number | null) => void;
  /** Size in px when `size` is `null`, and what a double click on the handle returns to. */
  defaultSize?: number;
  /** Smallest size in px, inclusive. */
  min?: number;
  /** Largest size in px, inclusive. The pane never takes more than the splitter less the handle. */
  max?: number;
  /** Saves the size in `localStorage` under `ds-splitter:<key>` and restores it on init, over `size`. */
  persistKey?: string;
  /** Accessible name of the handle; unset falls back to `DS_INTL.splitter.label`. Name what it resizes. */
  ariaLabel?: string | null;
  /** Dragged past `min` or `max`: `'elastic'` follows the pointer with growing resistance and springs back on release, `'none'` stops at the limit. Off under `prefers-reduced-motion: reduce`. */
  overdrag?: ('elastic' | 'none');
  /** While dragging, shades the pane the handle moves towards, stronger the faster and farther the drag; the shade rides the rubber band past a limit and fades when the hand stops or lets go. Colour: `--ds-splitter-fog-color`. Off under `prefers-reduced-motion: reduce`. */
  dragFog?: boolean;
  /** Content for the `[start]` slot. */
  start?: React.ReactNode;
  /** Content for the `[end]` slot. */
  end?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Splitter: React.ComponentType<SplitterProps>;
