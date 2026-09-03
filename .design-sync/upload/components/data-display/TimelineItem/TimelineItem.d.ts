import * as React from 'react';

/**
 * TimelineItem — the real TimelineItemComponent, run by Angular behind `<ds-timeline-item>`.
 * Single timeline entry (`ds-timeline-item`) — a marker column (circular node + spine) beside a content column. Use only as a direct child of `Timeline`.
 */
export interface TimelineItemProps {
  /** Primary text for the entry. */
  heading?: string;
  /** Timestamp or date label shown below the content. */
  time?: string;
  /** Icon shown in the marker; omit for a plain dot. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** Semantic accent color for the marker. */
  tone?: ('default' | 'primary' | 'success' | 'warning' | 'error' | 'muted');
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const TimelineItem: React.ComponentType<TimelineItemProps>;
