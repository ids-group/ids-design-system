import * as React from 'react';

/**
 * DescriptionList — the real DescriptionListComponent, run by Angular behind `<ds-description-list>`.
 * Term/detail pairs — a flex column of `DescriptionItem` rows for read-only record details (shipment metadata, account fields).
 */
export interface DescriptionListProps {
  /** horizontal = label column + value; stacked = label above value. */
  orientation?: ('horizontal' | 'stacked');
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const DescriptionList: React.ComponentType<DescriptionListProps>;
