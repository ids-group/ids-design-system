import * as React from 'react';
import { Card, LoadingOverlay } from '@ids-group-ltd/ids-design-system';

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  padding: '8px 0',
  borderBottom: '1px solid var(--border-default)',
  font: '400 13px/1.5 var(--font-sans)',
};
const muted: React.CSSProperties = { color: 'var(--text-secondary)' };

const Shipments = () => (
  <div>
    <div style={{ ...rowStyle, fontWeight: 600, ...muted }}>
      <span>Consignment</span>
      <span>Destination</span>
    </div>
    <div style={rowStyle}>
      <span>IDS-48211</span>
      <span style={muted}>EC1A 1BB · London</span>
    </div>
    <div style={rowStyle}>
      <span>IDS-48214</span>
      <span style={muted}>M1 4AE · Manchester</span>
    </div>
    <div style={{ ...rowStyle, borderBottom: 'none' }}>
      <span>IDS-48219</span>
      <span style={muted}>LS1 5QS · Leeds</span>
    </div>
  </div>
);

/** Scrim + spinner + label over a live region — content stays mounted
 *  underneath while `loading` is true. */
export const Saving = () => (
  <div style={{ width: 400 }}>
    <Card padding="md">
      <LoadingOverlay loading label="Saving allocations…">
        <Shipments />
      </LoadingOverlay>
    </Card>
  </div>
);

/** `blur={false}` — the scrim only dims; content behind stays legible. */
export const NoBlur = () => (
  <div style={{ width: 400 }}>
    <Card padding="md">
      <LoadingOverlay loading blur={false} spinnerSize="sm">
        <Shipments />
      </LoadingOverlay>
    </Card>
  </div>
);

/** `insetTop` keeps a sticky header uncovered while the body loads. */
export const HeaderInset = () => (
  <div style={{ width: 400 }}>
    <Card padding="md">
      <LoadingOverlay loading insetTop="40px" label="Refreshing…">
        <div
          style={{
            height: 40,
            display: 'flex',
            alignItems: 'center',
            font: '700 14px/1 var(--font-sans)',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          Today's collections — Barking depot
        </div>
        <Shipments />
      </LoadingOverlay>
    </Card>
  </div>
);
