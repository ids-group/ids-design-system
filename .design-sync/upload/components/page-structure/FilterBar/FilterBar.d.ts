import * as React from 'react';

/**
 * FilterBar — the real FilterBarComponent, run by Angular behind `<ds-x-filter-bar>`.
 * The filter row above a table or list. Visible filters sit inline; the rest collapse into a "More" popover when the row runs out of width.
 */
export interface FilterBarProps {
  /** Trailing word of the trigger, after the count: "+2 filters". Unset falls back to `DS_INTL.filterBar.more`. */
  moreLabel?: string | null;
  /** Accessible name of the overflow panel. Unset falls back to `DS_INTL.filterBar.panelLabel`. */
  panelLabel?: string | null;
  /** Height of the "+N" trigger, to match the filters beside it. The bar cannot infer this: `dsFilterItem` carries a WIDTH, and the filters are arbitrary projected controls whose own `size` it never sees — so a row of `sm` filters got an `md` trigger standing 8px taller under `align-items: flex-end`. */
  triggerSize?: ('sm' | 'md' | 'lg');
  /** Content for the `[dsFilterBarTrailing]` slot. */
  trailing?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const FilterBar: React.ComponentType<FilterBarProps>;
