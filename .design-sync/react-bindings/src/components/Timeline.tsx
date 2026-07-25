import * as React from 'react';
import { host } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';

export type TimelineTone = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'muted';

export interface TimelineProps {
  /** `TimelineItem` elements, newest-first or oldest-first as the page dictates. */
  children?: React.ReactNode;
}

/** Vertical event list — port of `ds-timeline`. Pure container (role="list");
 *  each entry is a `TimelineItem`. The connecting spine is drawn by the items
 *  themselves and hidden on the last one via `:host(:last-child)` CSS. */
export function Timeline({ children }: TimelineProps) {
  return host('ds-timeline', { role: 'list' }, children);
}

export interface TimelineItemProps {
  /** Primary text for the entry. */
  heading?: string;
  /** Timestamp or date label shown below the content. */
  time?: string;
  /** Icon shown in the marker; omit for a plain dot. */
  icon?: IconName | null;
  /** Semantic accent color for the marker. Default 'default'. */
  tone?: TimelineTone;
  /** Body content, rendered between `heading` and `time`. */
  children?: React.ReactNode;
}

/** Single timeline entry — port of `ds-timeline-item`. Marker column (node +
 *  spine) beside a content column. `tone` sets the `data-tone` host attribute
 *  the DS CSS keys marker colors off. */
export function TimelineItem({
  heading = '',
  time = '',
  icon = null,
  tone = 'default',
  children,
}: TimelineItemProps) {
  return host(
    'ds-timeline-item',
    { role: 'listitem', 'data-tone': tone },
    <div className="node-col">
      <span className="node">{icon && <Icon name={icon} size={15} />}</span>
      <span className="spine" />
    </div>,
    <div className="content">
      {heading && <span className="heading">{heading}</span>}
      {children}
      {time && <span className="time">{time}</span>}
    </div>,
  );
}
