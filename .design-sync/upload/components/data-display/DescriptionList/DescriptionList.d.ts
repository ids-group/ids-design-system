import * as React from 'react';

/**
 * DescriptionList — the real DescriptionListComponent, run by Angular behind `<ds-description-list>`.
 * Term/detail pairs — a flex column of `DescriptionItem` rows for read-only record details (shipment metadata, account fields).
 */
export interface DescriptionListProps {
  /** horizontal = label column + value, every item stacking once a value would get less than --ds-description-list-value-min-width; stacked = label above value at every width. */
  orientation?: ('horizontal' | 'stacked');
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const DescriptionList: React.ComponentType<DescriptionListProps>;
