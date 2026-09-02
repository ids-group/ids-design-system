import * as React from 'react';
import { Slider } from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 24, width: 340 };
const labelRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 13,
  marginBottom: 8,
};

/** Single thumb — the filled track segment tracks the value. */
export const Basic = () => (
  <div style={col}>
    <div>
      <div style={labelRow}>
        <span>Vehicle load</span>
        <span>65%</span>
      </div>
      <Slider value={65} min={0} max={100} ariaLabel="Vehicle load" />
    </div>
    <div>
      <div style={labelRow}>
        <span>Max parcel weight</span>
        <span>18 kg</span>
      </div>
      <Slider value={18} min={0} max={30} ariaLabel="Max parcel weight" />
    </div>
  </div>
);

/** Two-thumb range mode — value is a [low, high] tuple. */
export const Range = () => (
  <div style={col}>
    <div>
      <div style={labelRow}>
        <span>Delivery charge band</span>
        <span>£4 – £12</span>
      </div>
      <Slider range value={[4, 12]} min={0} max={25} ariaLabel="Delivery charge band" />
    </div>
    <div>
      <div style={labelRow}>
        <span>Collection window</span>
        <span>08:00 – 14:00</span>
      </div>
      <Slider range value={[8, 14]} min={6} max={20} ariaLabel="Collection window" />
    </div>
  </div>
);

/** Hint text, error styling, and the disabled treatment. */
export const States = () => (
  <div style={col}>
    <div>
      <div style={labelRow}>
        <span>Route density</span>
        <span>40 drops</span>
      </div>
      <Slider value={40} min={0} max={80} hint="Drops assigned per round." ariaLabel="Route density" />
    </div>
    <div>
      <div style={labelRow}>
        <span>Route density</span>
        <span>78 drops</span>
      </div>
      <Slider
        value={78}
        min={0}
        max={80}
        invalid
        hint="Exceeds the safe drops-per-round limit."
        ariaLabel="Route density — error"
      />
    </div>
    <div>
      <div style={labelRow}>
        <span>Vehicle load</span>
        <span>50%</span>
      </div>
      <Slider value={50} min={0} max={100} disabled ariaLabel="Vehicle load — locked" />
    </div>
  </div>
);
