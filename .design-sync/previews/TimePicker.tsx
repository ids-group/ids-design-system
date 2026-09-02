import * as React from 'react';
import { TimePicker } from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 16, width: 320 };
// The inline .time-panel stretches to the host width — hug the content so the
// open columns keep their natural width (see W3B learnings).
const hug: React.CSSProperties = { width: 'fit-content' };

/** Closed triggers — empty, set + clearable, invalid, disabled. All values fixed. */
export const Basic = () => (
  <div style={col}>
    <TimePicker ariaLabel="Collection slot" hint="Depot collection window 06:00–18:00." />
    <TimePicker ariaLabel="Departure time" value="14:30" clearable />
    <TimePicker ariaLabel="Cut-off time" invalid hint="A cut-off time is required." />
    <TimePicker ariaLabel="Gate check" value="07:45" disabled />
  </div>
);

/** sm / md / lg trigger heights — aligned with Input and Select. */
export const Sizes = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
    <TimePicker size="sm" ariaLabel="Slot · sm" value="09:15" clearable />
    <TimePicker size="md" ariaLabel="Slot · md" value="09:15" clearable />
    <TimePicker size="lg" ariaLabel="Slot · lg" value="09:15" clearable />
  </div>
);

/** Open single panel — hours/minutes columns centred on the fixed 14:30 value. */
export const OpenSingle = () => (
  <div style={hug}>
    <TimePicker
      ariaLabel="Departure time"
      value="14:30"
      hint="Trunk departs Manchester Trafford."
    />
  </div>
);

/** 12-hour display adds the AM/PM column; the stored value stays 24h ("14:30"). */
export const OpenTwelveHour = () => (
  <div style={hug}>
    <TimePicker
      ariaLabel="Delivery ETA"
      format="12h"
      value="14:30"
      minuteStep={5}
    />
  </div>
);

/** Range pair with the END panel open — hours before the 08:00 start are disabled. */
export const OpenRange = () => (
  <div style={hug}>
    <TimePicker
      mode="range"
      ariaLabel="Driver shift"
      value={['08:00', '16:30']}
      minuteStep={15}
      hint="Shift end cannot precede the start."
    />
  </div>
);
