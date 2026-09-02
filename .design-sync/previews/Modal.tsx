import * as React from 'react';
import {
  Banner,
  Button,
  Input,
  Modal,
  Select,
} from '@ids-group-ltd/ids-design-system';

const stack: React.CSSProperties = {
  display: 'grid',
  gap: 10,
  justifyItems: 'start',
};
const caption: React.CSSProperties = { marginTop: 4 };

const cancel = (
  <Button color="neutral" variant="outline">
    Cancel
  </Button>
);

/** Canonical form dialog — `staticPreview` (the DS's own docs mechanism)
 *  renders the card in normal flow without the fixed scrim. */
export const FormModal = () => (
  <Modal staticPreview size="md" title="Edit delivery slot" actions={
    <>
      {cancel}
      <Button>Save changes</Button>
    </>
  }>
    <div style={{ display: 'grid', gap: 16 }}>
      <Input label="Consignment" value="IDS-48211 · 14 pallets" />
      <Input
        label="Delivery window"
        value="09:00 – 12:00"
        hint="Driver calls the site contact 30 minutes ahead."
      />
      <Select
        label="Depot"
        value="leeds"
        options={[
          { label: 'Leeds — LS1 4AP', value: 'leeds' },
          { label: 'Manchester — M1 2AB', value: 'manchester' },
          { label: 'Sheffield — S1 2HE', value: 'sheffield' },
        ]}
      />
    </div>
  </Modal>
);

/** sm / md / lg static specimens, as the DS docs compare them. xl and
 *  fullscreen are near-viewport wide — live-demo only, skipped here. */
export const Sizes = () => (
  <div style={stack}>
    <div>
      <Modal staticPreview size="sm" title="Quick confirm" actions={
        <>
          {cancel}
          <Button>Confirm</Button>
        </>
      }>
        Tight modal for binary confirmations and short messages.
      </Modal>
      <div className="t-caption" style={caption}>sm · 480 px</div>
    </div>

    <div>
      <Modal staticPreview size="md" title="Edit order ORD-2026-0156" actions={
        <>
          {cancel}
          <Button>Save</Button>
        </>
      }>
        Default size for most edits, detail dialogs and confirmations.
      </Modal>
      <div className="t-caption" style={caption}>md · 640 px</div>
    </div>

    <div>
      <Modal staticPreview size="lg" title="Run manifest report" actions={
        <>
          {cancel}
          <Button>Run report</Button>
        </>
      }>
        Wider canvas for forms, multi-column previews, and bulk-edit dialogs.
      </Modal>
      <div className="t-caption" style={caption}>lg · 800 px</div>
    </div>
  </div>
);

/** `error` — danger styling for destructive confirmations. */
export const DangerConfirm = () => (
  <Modal staticPreview size="sm" error title="Delete waypoint?" actions={
    <>
      {cancel}
      <Button color="error">Delete</Button>
    </>
  }>
    This cannot be undone. 12 resource allocations at Rotherham S60 1TG will
    be released back to the pool.
  </Modal>
);

/** The `impact` slot — affected-records banner between body and actions
 *  (`.impact .list` styles the bullet list inside). */
export const ImpactWarning = () => (
  <Modal
    staticPreview
    size="md"
    title="Confirm recompute"
    impact={
      <Banner variant="severe" title="Affected records">
        <ul className="list">
          <li>Route Alpha · 3 logistics plans</li>
          <li>Route Beta · 8 resource allocations</li>
          <li>Route Gamma · 1 sub-record</li>
        </ul>
      </Banner>
    }
    actions={
      <>
        {cancel}
        <Button>Recompute &amp; save</Button>
      </>
    }
  >
    Saving these dates will recompute downstream allocations across three
    routes.
  </Modal>
);

/** The real open dialog — fixed `.modal-backdrop` scrim captured by a
 *  transformed wrapper acting as a mini viewport. */
export const OverScrim = () => (
  <div
    style={{
      position: 'relative',
      transform: 'translateZ(0)',
      overflow: 'hidden',
      height: 420,
      borderRadius: 8,
      border: '1px solid var(--border-default)',
    }}
  >
    <div style={{ padding: 24 }}>
      <h4 className="t-h5" style={{ margin: '0 0 4px' }}>
        Tonight&rsquo;s trunk runs — Barking depot
      </h4>
      <p className="t-s" style={{ margin: 0 }}>
        Depot 12 → Depot 4 · 22 drops · departs 06:40 · driver Amelia Barnes.
      </p>
      <p className="t-s" style={{ margin: '8px 0 0' }}>
        Bay 14 is double-booked from 07:00; the 07:10 arrival from Leeds
        LS1 4AP is holding.
      </p>
    </div>

    <Modal size="sm" title="Release booked slot?" actions={
      <>
        {cancel}
        <Button>Release slot</Button>
      </>
    }>
      Releasing slot 14 frees the bay for the 07:10 arrival from Leeds
      LS1 4AP. The current booking moves to the standby queue.
    </Modal>
  </div>
);
