import * as React from 'react';
import { Tag } from '@ids-group-ltd/ids-design-system';

const row: React.CSSProperties = { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' };

/** Solid (brand fill) for selected tokens; neutral for metadata chips. */
export const Variants = () => (
  <div style={row}>
    <Tag>Fragile</Tag>
    <Tag variant="neutral">Pallet · half</Tag>
  </div>
);

/** `closable` adds the × affordance — removable filter tokens. */
export const Closable = () => (
  <div style={row}>
    <Tag closable closeLabel="Remove Fragile">
      Fragile
    </Tag>
    <Tag variant="neutral" closable closeLabel="Remove Depot North filter">
      Depot · North
    </Tag>
  </div>
);

/** `interactive` + `selected` = toggleable filter-chip row. */
export const FilterChips = () => (
  <div style={row}>
    <Tag variant="neutral" interactive selected>
      Leeds LS1
    </Tag>
    <Tag variant="neutral" interactive>
      Manchester M1
    </Tag>
    <Tag variant="neutral" interactive>
      Sheffield S1
    </Tag>
  </div>
);
