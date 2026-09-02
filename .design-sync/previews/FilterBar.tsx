import * as React from 'react';
import { FilterBar, Select, DatePicker, Button, MultiSelect } from '@ids-group-ltd/ids-design-system';

const depots = [
  { value: 'leeds', label: 'Leeds LS1 4AP' },
  { value: 'croydon', label: 'Croydon CR0 2RF' },
];
const statuses = [
  { value: 'open', label: 'Open' },
  { value: 'held', label: 'Held' },
  { value: 'done', label: 'Delivered' },
];

const frame: React.CSSProperties = { width: 760 };

/** The filter row as it sits above a table: filters inline, actions pinned right. */
export const Default = () => (
  <div style={frame}>
    <FilterBar moreLabel="More filters" triggerSize="sm">
      <Select options={depots} value="leeds" placeholder="Depot" size="sm" />
      <MultiSelect options={statuses} value={['open']} placeholder="Status" size="sm" />
      <DatePicker placeholder="From" size="sm" />
    </FilterBar>
  </div>
);

/** Narrow frame — the filters that do not fit collapse behind the overflow trigger. */
export const Overflowing = () => (
  <div style={{ width: 360 }}>
    <FilterBar moreLabel="More" panelLabel="Additional filters" triggerSize="sm">
      <Select options={depots} value="croydon" placeholder="Depot" size="sm" />
      <MultiSelect options={statuses} value={['held', 'done']} placeholder="Status" size="sm" />
      <DatePicker placeholder="From" size="sm" />
      <DatePicker placeholder="To" size="sm" />
    </FilterBar>
  </div>
);
