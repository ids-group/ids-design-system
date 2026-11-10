import * as React from 'react';

/**
 * TimelineItem — the real TimelineItemComponent, run by Angular behind `<ds-timeline-item>`.
 * Single timeline entry (`ds-timeline-item`) — a marker column (circular node + spine) beside a content column. Use inside `Timeline`. The marker centres on the heading, content and time together.
 */
export interface TimelineItemProps {
  /** Primary text for the entry. */
  heading?: string;
  /** Timestamp or date label below the content. */
  time?: string;
  /** Marker icon; omit for a plain dot. Ignored while `status` is set. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +76 more */ | null;
  /** Semantic accent color for the marker. Ignored while `status` is set. */
  tone?: ('default' | 'primary' | 'success' | 'warning' | 'error' | 'muted');
  /** Step state: draws the marker and is spoken before the heading. `null` leaves `icon` and `tone` in charge. */
  status?: ('done' | 'running' | 'pending' | 'error') | null;
  /** Whether the `[details]` area is open, two-way bound. */
  expanded?: boolean;
  onExpandedChange?: (value: boolean) => void;
  /** Content for the `[trailing]` slot. */
  trailing?: React.ReactNode;
  /** Content for the `[details]` slot. */
  details?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const TimelineItem: React.ComponentType<TimelineItemProps>;
