import * as React from 'react';

/**
 * Timeline — the real TimelineComponent, run by Angular behind `<ds-timeline>`.
 * Vertical event list (`ds-timeline`) — a compound container (`role="list"`) whose only expected children are `TimelineItem` elements. It has no props of its own; the marker column, connecting spine and spacing are all drawn by the items (the spine auto-hides on the last item via `:host(:last-child)` CSS).
 */
export interface TimelineProps {
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Timeline: React.ComponentType<TimelineProps>;
