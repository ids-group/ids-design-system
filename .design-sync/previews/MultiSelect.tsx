import * as React from 'react';
import { MultiSelect, type MultiSelectOption } from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 16, width: 340 };

const courierOptions: MultiSelectOption[] = [
  { label: 'DPD Local', value: 'dpd' },
  { label: 'Evri Standard', value: 'evri' },
  { label: 'Royal Mail Tracked 24', value: 'rm24' },
  { label: 'Parcelforce Worldwide', value: 'pfw' },
  { label: 'DHL Express', value: 'dhl', disabled: true },
  { label: 'Yodel Direct', value: 'yodel' },
];

const handlingOptions: MultiSelectOption[] = [
  { label: 'Fragile', value: 'fragile' },
  { label: 'Chilled', value: 'chilled' },
  { label: 'Oversize', value: 'oversize' },
  { label: 'Hazardous (ADR)', value: 'hazmat' },
  { label: 'High value', value: 'high-value' },
];

/** Empty trigger with placeholder + hint, and a trigger holding removable chips. */
export const Chips = () => (
  <div style={col}>
    <MultiSelect
      placeholder="Allowed carriers…"
      ariaLabel="Allowed carriers"
      hint="Only these carriers are offered at checkout."
      options={courierOptions}
    />
    <MultiSelect
      placeholder="Allowed carriers…"
      ariaLabel="Allowed carriers"
      value={['dpd', 'rm24', 'pfw']}
      options={courierOptions}
    />
  </div>
);

/** maxVisibleChips collapses extra selections into a "+N more" pill. */
export const Overflow = () => (
  <div style={col}>
    <MultiSelect
      placeholder="Handling flags…"
      ariaLabel="Handling flags"
      value={['fragile', 'chilled', 'oversize', 'high-value']}
      maxVisibleChips={2}
      options={handlingOptions}
    />
  </div>
);

/** Open panel inline — filter input, indeterminate Select-all, checked and disabled options. */
export const Open = () => (
  <div style={col}>
    <MultiSelect
      placeholder="Allowed carriers…"
      ariaLabel="Allowed carriers"
      value={['dpd', 'rm24']}
      selectAll
      searchPlaceholder="Filter carriers…"
      open
      options={courierOptions}
    />
  </div>
);

/** Error and disabled treatments. */
export const States = () => (
  <div style={col}>
    <MultiSelect
      placeholder="Handling flags…"
      ariaLabel="Handling flags — error"
      invalid
      hint="At least one handling flag is required for ADR loads."
      options={handlingOptions}
    />
    <MultiSelect
      placeholder="Allowed carriers…"
      ariaLabel="Allowed carriers — disabled"
      value={['dpd', 'evri']}
      disabled
      options={courierOptions}
    />
  </div>
);
