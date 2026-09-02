import * as React from 'react';
import { ToggleButton } from '@ids-group-ltd/ids-design-system';

const row: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' };

/** Standalone on/off filter toggles — optional leading icon + projected label. */
export const Basic = () => (
  <div style={row}>
    <ToggleButton icon="filter">Conflicts only</ToggleButton>
    <ToggleButton icon="check" pressed>
      Confirmed
    </ToggleButton>
    <ToggleButton>Weekend delivery</ToggleButton>
  </div>
);

/** Disabled blocks toggling in either state. */
export const Disabled = () => (
  <div style={row}>
    <ToggleButton icon="bell" disabled>
      Notify driver
    </ToggleButton>
    <ToggleButton icon="check" pressed disabled>
      Signed for
    </ToggleButton>
  </div>
);
