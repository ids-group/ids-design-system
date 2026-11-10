import * as React from 'react';

/**
 * Timeline — the real TimelineComponent, run by Angular behind `<ds-timeline>`.
 * Vertical event list (`ds-timeline`) — a compound container (`role="list"`) whose expected children are `TimelineItem` elements. It has no props of its own; the marker column, connecting line and spacing are drawn by the items, and only the last item of the timeline draws no line below its marker.
 */
export interface TimelineProps {
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Timeline: React.ComponentType<TimelineProps>;
