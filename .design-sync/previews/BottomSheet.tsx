import * as React from 'react';
import {
  BottomSheet,
  Button,
  Input,
  List,
  ListItem,
  Icon,
} from '@ids-group-ltd/ids-design-system';

/** `.sheet-overlay` is `position: fixed; inset: 0` — the transformed wrapper
 *  is its containing block. ~380 px wide reads phone-like. */
const phone: React.CSSProperties = {
  position: 'relative',
  transform: 'translateZ(0)',
  overflow: 'hidden',
  width: 380,
  height: 480,
  borderRadius: 12,
  border: '1px solid var(--border-default)',
};

const pageBehind = (
  <div style={{ padding: 20 }}>
    <h4 className="t-h5" style={{ margin: '0 0 4px' }}>
      Run 22 — 8 drops left
    </h4>
    <p className="t-s" style={{ margin: 0 }}>
      Next: 14 Finsbury Sq, London EC1A 1BB · ETA 16:40.
    </p>
  </div>
);

/** Canonical open sheet — grabber, title, body and stacked full-width
 *  `actions`. Sizes to content (capped at 80% of the viewport). */
export const EditRegistration = () => (
  <div style={phone}>
    {pageBehind}

    <BottomSheet
      title="Edit registration"
      actions={
        <>
          <Button fullWidth>Save</Button>
          <Button fullWidth color="neutral" variant="outline">
            Cancel
          </Button>
        </>
      }
    >
      <p className="t-s" style={{ margin: 0 }}>
        Update the vehicle registration. Changes apply to the current event
        only.
      </p>
      <Input label="Registration" value="YK24 XQL" />
    </BottomSheet>
  </div>
);

/** `snapPoints` pins the height to the active stop — open at the first stop
 *  (35% of viewport height; vh is viewport-relative, not wrapper-relative). */
export const SnapPoints = () => (
  <div style={phone}>
    {pageBehind}

    <BottomSheet
      title="Filter results"
      snapPoints={[0.35, 0.65, 0.9]}
      actions={
        <Button fullWidth>Apply filters</Button>
      }
    >
      <p className="t-s" style={{ margin: 0 }}>
        Drag the handle to snap between 35%, 65% and 90% of the viewport
        height. Drag past the lowest stop to close.
      </p>
    </BottomSheet>
  </div>
);

/** Action-list sheet — tappable rows instead of a form. */
export const ActionSheet = () => (
  <div style={phone}>
    {pageBehind}

    <BottomSheet
      title="Order ORD-2026-0142"
      actions={
        <Button fullWidth color="neutral" variant="outline">
          Close
        </Button>
      }
    >
      <List dividers={false}>
        <ListItem
          clickable
          title="Track shipment"
          leading={<Icon name="truck" size={20} />}
        />
        <ListItem
          clickable
          title="Edit delivery notes"
          leading={<Icon name="edit" size={20} />}
        />
        <ListItem
          clickable
          title="Report an issue"
          leading={<Icon name="flag" size={20} />}
        />
        <ListItem
          clickable
          title="Cancel order"
          leading={<Icon name="trash" size={20} />}
        />
      </List>
    </BottomSheet>
  </div>
);
