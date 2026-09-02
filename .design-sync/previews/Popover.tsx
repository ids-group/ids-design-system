import * as React from 'react';
import { Button, Checkbox, Popover } from '@ids-group-ltd/ids-design-system';

/* The panel renders inline (open defaults to true), so stories just place it.
 * Arrowed panels overflow 7px on the arrow side — pad that side slightly. */

/** Canonical text-and-action panel (the DS docs' own specimen). */
export const Summary = () => (
  <div style={{ display: 'flex', padding: 8 }}>
    <Popover>
      <div style={{ width: 248 }}>
        <h4 className="t-s-bold" style={{ margin: '0 0 4px' }}>Recompute summary</h4>
        <p className="t-s" style={{ color: 'var(--text-secondary)', margin: '0 0 12px' }}>
          3 logistics plans · 12 resource allocations · 2 sub-records affected.
        </p>
        <Button size="sm" fullWidth>View details</Button>
      </div>
    </Popover>
  </div>
);

/** Interactive filter panel — `panelRole="dialog"` + label, arrow pointing up
 *  at the (imaginary) trigger above, `placement="bottom"`. */
export const FilterPanel = () => (
  <div style={{ display: 'flex', padding: '16px 8px 8px' }}>
    <Popover arrow placement="bottom" panelRole="dialog" panelLabel="Filter shipments">
      <div style={{ width: 260, display: 'grid', gap: 10 }}>
        <h4 className="t-s-bold" style={{ margin: 0 }}>Filter shipments</h4>
        <Checkbox label="Out for delivery" checked />
        <Checkbox label="At depot" checked />
        <Checkbox label="Failed — card left" />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 2 }}>
          <Button size="sm" variant="ghost" color="neutral">Clear</Button>
          <Button size="sm">Apply</Button>
        </div>
      </div>
    </Popover>
  </div>
);

/** Confirm popover with `placement="top"` — the arrow points down at the
 *  trigger the panel would sit above. */
export const ConfirmPanel = () => (
  <div style={{ display: 'flex', padding: '8px 8px 16px' }}>
    <Popover arrow placement="top" panelRole="dialog" panelLabel="Cancel collection">
      <div style={{ width: 284 }}>
        <h4 className="t-s-bold" style={{ margin: '0 0 4px' }}>Cancel collection?</h4>
        <p className="t-s" style={{ color: 'var(--text-secondary)', margin: '0 0 12px' }}>
          Driver Amelia Barnes will be stood down and the slot at depot LDS-02 released.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button size="sm" variant="ghost" color="neutral">Keep booking</Button>
          <Button size="sm" color="error">Cancel collection</Button>
        </div>
      </div>
    </Popover>
  </div>
);
