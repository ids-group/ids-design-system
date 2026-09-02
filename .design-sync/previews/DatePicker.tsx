import * as React from 'react';
import { DatePicker, type DatePickerPreset } from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 16, width: 320 };

// Fixed dates only — March 2026 is a PAST month, so the live "today" ring can
// never appear inside any visible grid and the capture stays deterministic.
const MAR = (day: number) => new Date(2026, 2, day);
const MARCH_2026 = new Date(2026, 2, 1);

const reportingPresets: DatePickerPreset[] = [
  { label: 'This week', value: [MAR(9), MAR(15)] },
  { label: 'Next week', value: [MAR(16), MAR(22)] },
  { label: 'Full month', value: [MAR(1), MAR(31)] },
  { label: 'Stocktake day', value: MAR(27) },
];

/** Closed fields — single with value, UK-format range, required empty mask. */
export const Basic = () => (
  <div style={col}>
    <DatePicker
      label="Dispatch date"
      hint="Stock leaves the Leeds depot on this day."
      value={MAR(12)}
      dateFormat="DD/MM/YYYY"
    />
    <DatePicker
      mode="range"
      label="Delivery window"
      optional
      value={[MAR(9), MAR(13)]}
      dateFormat="DD/MM/YYYY"
    />
    <DatePicker label="Booking date" placeholder="Pick a date" required />
  </div>
);

/** Invalid, disabled and calendar-only (readonly field) treatments. */
export const States = () => (
  <div style={col}>
    <DatePicker
      label="Collection date"
      hint="A collection date is required to book the vehicle."
      invalid
      dateFormat="DD/MM/YYYY"
    />
    <DatePicker
      mode="range"
      label="Depot shutdown"
      hint="Locked by the network planner."
      value={[MAR(2), MAR(6)]}
      disabled
      dateFormat="DD/MM/YYYY"
    />
    <DatePicker
      label="Pick from calendar"
      hint="Calendar-only — typing is off."
      value={MAR(18)}
      allowInput={false}
      dateFormat="DD/MM/YYYY"
    />
  </div>
);

/** Open one-month calendar — selected day, min/max bounds greying the edges. */
export const OpenCalendar = () => (
  <DatePicker
    label="Dispatch date"
    hint="Bookable slots: 3–27 March."
    value={MAR(12)}
    minDate={MAR(3)}
    maxDate={MAR(27)}
    dateFormat="DD/MM/YYYY"
  />
);

/** Open range calendar — start/end caps with the in-range span tinted. */
export const OpenRange = () => (
  <DatePicker
    mode="range"
    label="Delivery window"
    value={[MAR(9), MAR(20)]}
    dateFormat="DD/MM/YYYY"
  />
);

/** Quick-pick presets column beside the grid (widens the panel). */
export const OpenPresets = () => (
  <DatePicker
    mode="range"
    label="Reporting period"
    value={[MAR(9), MAR(15)]}
    presets={reportingPresets}
    dateFormat="DD/MM/YYYY"
  />
);
