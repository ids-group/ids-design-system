import * as React from 'react';
import { W3w } from '@ids-group-ltd/ids-design-system';

const row: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  flexWrap: 'wrap',
};

/** Canonical copyable pill — map glyph, danger-red /// mark, monospace
 *  brand-coloured address, trailing copy icon. */
export const Default = () => <W3w address="filled.count.soap" />;

/** copyable (default, role="button" + copy icon) vs static
 *  `copyable={false}` (no copy icon), plus a custom `prefix` mark. */
export const Variants = () => (
  <div style={row}>
    <W3w address="daring.lion.race" />
    <W3w address="static.island.bay" copyable={false} />
    <W3w prefix="w3w:" address="hooked.slower.deals" />
  </div>
);

/** Inline beside a label — the pill sits on the line like a badge/tag,
 *  e.g. a delivery-point row on a consignment record. */
export const InlineWithLabel = () => (
  <div style={row}>
    <span className="t-s">Drop-off point · Gate 4, Sheffield S1 2HE</span>
    <W3w address="filled.count.soap" />
  </div>
);
