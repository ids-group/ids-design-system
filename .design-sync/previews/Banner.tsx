import * as React from 'react';
import { Banner, Button } from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 12, width: 640 };

/** All six severity tones — dismissible, with title + body. */
export const Variants = () => (
  <div style={col}>
    <Banner variant="info" title="Inventory sync paused" dismissible>
      Last sync 14 minutes ago. Resume to fetch the latest asset register.
    </Banner>
    <Banner variant="success" title="3 logistics plans recomputed" dismissible>
      All allocations are within the 95% capacity limit.
    </Banner>
    <Banner variant="warning" title="Approaching capacity limit" dismissible>
      Lane 04 is at 92% of the 95% volume cap.
    </Banner>
    <Banner variant="severe" title="Depot handover overdue" dismissible>
      Trailer IDS-TR-091 has waited 45 minutes at the Barking depot gate.
    </Banner>
    <Banner variant="error" title="Resource conflict detected" dismissible>
      2× Conference room kit is allocated to both Alpha (30 Jul) and Delta
      (5 Aug). Resolve before save.
    </Banner>
    <Banner variant="neutral" title="Maintenance window scheduled" dismissible>
      Read-only access this Sunday 02:00–04:00 UTC.
    </Banner>
  </div>
);

/** Action buttons in the `actions` slot — used when the user must respond. */
export const WithActions = () => (
  <div style={col}>
    <Banner
      variant="severe"
      title="Recompute required"
      actions={
        <>
          <Button size="sm">Preview impact</Button>
          <Button color="neutral" variant="outline" size="sm">
            Cancel
          </Button>
        </>
      }
    >
      Changing the build start will recompute 3 logistics plans and 12 resource
      allocations across Alpha, Beta and Gamma.
    </Banner>
  </div>
);

/** `compact` — single-line strip, title and dismiss only. */
export const Compact = () => (
  <div style={col}>
    <Banner
      variant="info"
      title="Schedule updated · changes go live in 5 min"
      compact
      dismissible
    />
    <Banner
      variant="warning"
      title="Unsaved changes — leaving will discard them"
      compact
      dismissible
    />
  </div>
);

/** `layout="row"` keeps a single CTA inline on the right;
 *  `layout="stacked"` (default) wraps actions onto their own line. */
export const Layouts = () => (
  <div style={col}>
    <Banner
      variant="info"
      title="Schedule updated"
      layout="row"
      actions={<Button size="sm">Preview</Button>}
    >
      Changes go live in 5 minutes.
    </Banner>
    <Banner
      variant="warning"
      title="Approaching capacity limit"
      layout="stacked"
      actions={
        <>
          <Button size="sm">Re-balance</Button>
          <Button color="neutral" variant="outline" size="sm">
            Raise cap
          </Button>
        </>
      }
    >
      Lane 04 is at 92% of the 95% volume cap. Re-balance allocations or raise
      the cap before scheduling new pickups.
    </Banner>
  </div>
);

/** The coloured accent rail on the leading edge — on by default, `accentRail={false}` hides it. */
export const AccentRail = () => (
  <div style={col}>
    <Banner variant="success" title="All checks passed">
      12 resource allocations validated against the 95% capacity rule.
    </Banner>
    <Banner variant="success" title="All checks passed" accentRail={false}>
      12 resource allocations validated against the 95% capacity rule.
    </Banner>
  </div>
);
