import * as React from 'react';
import { Select, type SelectItem } from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 16, width: 320 };

const depotOptions: SelectItem[] = [
  { label: 'Birmingham Hub', value: 'bhx' },
  { label: 'Leeds North', value: 'lds' },
  { label: 'Manchester Trafford', value: 'man' },
  { label: 'Glasgow Central', value: 'gla', disabled: true },
  { label: 'Bristol Avonmouth', value: 'brs' },
];

const serviceOptions: SelectItem[] = [
  { label: 'Next day before 10:30', value: 'nd-1030' },
  { label: 'Next day before 12:00', value: 'nd-12' },
  { label: 'Next day end of day', value: 'nd-eod' },
  { label: 'Two-day economy', value: 'econ-2d' },
  { label: 'Saturday delivery', value: 'sat', disabled: true },
];

const courierGroups: SelectItem[] = [
  {
    label: 'Own fleet',
    options: [
      { label: 'IDS same-day van', value: 'ids-van', icon: 'truck' },
      { label: 'IDS overnight trunk', value: 'ids-trunk', icon: 'clock' },
    ],
  },
  {
    label: 'Partner carriers',
    options: [
      { label: 'DPD Local', value: 'dpd', icon: 'package' },
      { label: 'Parcelforce Worldwide', value: 'pfw', icon: 'globe' },
      { label: 'Evri Standard', value: 'evri', icon: 'box', disabled: true },
    ],
  },
];

/** Label, placeholder + hint; selected value with clearable ×; required marker. */
export const Basic = () => (
  <div style={col}>
    <Select
      label="Origin depot"
      placeholder="Pick a depot…"
      hint="Collections are routed from this site."
      options={depotOptions}
    />
    <Select label="Origin depot" value="lds" clearable options={depotOptions} />
    <Select label="Service level" placeholder="Choose a service…" required options={serviceOptions} />
  </div>
);

/** sm / md / lg trigger heights — aligned with Input. */
export const Sizes = () => (
  <div style={col}>
    <Select size="sm" label="Depot · sm" placeholder="Pick a depot…" options={depotOptions} />
    <Select size="md" label="Depot · md" placeholder="Pick a depot…" options={depotOptions} />
    <Select size="lg" label="Depot · lg" placeholder="Pick a depot…" options={depotOptions} />
  </div>
);

/** Error, disabled and read-only treatments. */
export const States = () => (
  <div style={col}>
    <Select
      label="Service level"
      placeholder="Choose a service…"
      invalid
      hint="A service level is required to book the collection."
      options={serviceOptions}
    />
    <Select label="Origin depot" value="bhx" disabled options={depotOptions} />
    <Select label="Origin depot" value="man" readOnly hint="Set by the account manager." options={depotOptions} />
  </div>
);

/** Open panel rendered inline — selected, active-on-hover and disabled options. */
export const Open = () => (
  <div style={col}>
    <Select label="Service level" value="nd-12" staticPreview options={serviceOptions} />
  </div>
);

/** Grouped options with per-option icons; the selected icon shows in the trigger too. */
export const OpenGrouped = () => (
  <div style={col}>
    <Select label="Carrier" value="dpd" staticPreview clearable options={courierGroups} />
  </div>
);
