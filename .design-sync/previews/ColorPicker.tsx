import * as React from 'react';
import { ColorPicker } from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 16, width: 320 };

// Curated route-label palette (the ds-docs "custom presets" set).
const routePalette = [
  '#16A34A',
  '#2F54FF',
  '#DC2626',
  '#D97706',
  '#7C3AED',
  '#0891B2',
  '#DB2777',
  '#65A30D',
];

/** Closed swatch + hex triggers — default, helper text, error, disabled. */
export const Basic = () => (
  <div style={col}>
    <ColorPicker ariaLabel="Brand colour" value="#2F54FF" />
    <ColorPicker
      ariaLabel="Accent colour"
      value="#0EA5E9"
      hint="Used for charts and route highlights."
    />
    <ColorPicker
      ariaLabel="Alert colour"
      value="#EAB308"
      invalid
      hint="Colour does not meet contrast requirements."
    />
    <ColorPicker ariaLabel="Fleet colour" value="#6B7280" disabled />
  </div>
);

/** Open panel at a fixed colour — SV plane, hue track, hex field, default presets. */
export const OpenPanel = () => (
  <ColorPicker ariaLabel="Brand colour" value="#2F54FF" />
);

/** Curated preset palette — the matching swatch shows the selected ring. */
export const OpenCustomPresets = () => (
  <ColorPicker
    ariaLabel="Route label colour"
    value="#16A34A"
    presets={routePalette}
    hint="Route colour on the depot map."
  />
);
