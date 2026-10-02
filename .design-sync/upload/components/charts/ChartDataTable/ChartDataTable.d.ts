import * as React from 'react';

/**
 * ChartDataTable — the real ChartDataTableComponent, run by Angular behind `<ds-x-chart-data-table>`.
 * Bare chart-data-table surface - port of `ds-chart-data-table`, the annex every chart puts under its plot: each reading in a `<details>` a reader can open, and the only route to the numbers for a reader with no pointer. Use directly only for static specimens or a custom chart; product charts render it themselves through their `dataTable` input.
 */
export interface ChartDataTableProps {
  columns?: readonly string[];
  rows?: unknown;
  caption?: string | null;
  open?: boolean;
  /** First cell of each row as a row header. */
  rowHeader?: boolean;
  /** Fires with the disclosure's state. */
  onToggled?: (value: boolean) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ChartDataTable: React.ComponentType<ChartDataTableProps>;
