import * as React from 'react';

/**
 * TimelineItem — the real TimelineItemComponent, run by Angular behind `<ds-timeline-item>`.
 * Single timeline entry (`ds-timeline-item`) — a marker column (circular node + spine) beside a content column. Use only as a direct child of `Timeline`.
 */
export interface TimelineItemProps {
  /** Primary text for the entry. */
  heading?: string;
  /** Timestamp or date label below the content. */
  time?: string;
  /** Marker icon; omit for a plain dot. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +69 more */ | null;
  /** Semantic accent color for the marker. */
  tone?: ('default' | 'primary' | 'success' | 'warning' | 'error' | 'muted');
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const TimelineItem: React.ComponentType<TimelineItemProps>;
