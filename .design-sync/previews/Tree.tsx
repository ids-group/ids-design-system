import * as React from 'react';
import { Tree } from '@ids-group-ltd/ids-design-system';

/** Nested folders expanded two levels deep, with a selected leaf.
 *  `expandedIds`/`selectedId` seed the internal state statically. */
export const Manifests = () => (
  <div style={{ maxWidth: 360 }}>
    <Tree
      nodes={[
        {
          id: 'shipments-2026',
          label: 'Shipments 2026',
          icon: 'folder',
          children: [
            {
              id: 'july',
              label: 'July',
              icon: 'folder',
              children: [
                { id: 'ord-0142', label: 'ORD-2026-0142.pdf', icon: 'file' },
                { id: 'ord-0156', label: 'ORD-2026-0156.pdf', icon: 'file' },
              ],
            },
            {
              id: 'august',
              label: 'August',
              icon: 'folder',
              children: [{ id: 'ord-0201', label: 'ORD-2026-0201.pdf', icon: 'file' }],
            },
            { id: 'summary', label: 'Q3-summary.xlsx', icon: 'file' },
          ],
        },
        {
          id: 'rosters',
          label: 'Depot rosters',
          icon: 'folder',
          children: [{ id: 'leeds-roster', label: 'Leeds-LS1.xlsx', icon: 'file' }],
        },
      ]}
      expandedIds={new Set(['shipments-2026', 'july'])}
      selectedId="ord-0142"
    />
  </div>
);

/** Single-node states: default, selected, disabled. */
export const NodeStates = () => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
    <div style={{ width: 180 }}>
      <Tree nodes={[{ id: 'node', label: 'POD-8817.pdf', icon: 'file' }]} />
    </div>

    <div style={{ width: 180 }}>
      <Tree nodes={[{ id: 'node', label: 'POD-8817.pdf', icon: 'file' }]} selectedId="node" />
    </div>

    <div style={{ width: 180 }}>
      <Tree nodes={[{ id: 'node', label: 'POD-8817.pdf', icon: 'file', disabled: true }]} />
    </div>
  </div>
);
