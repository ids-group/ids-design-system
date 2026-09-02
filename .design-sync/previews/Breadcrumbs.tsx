import * as React from 'react';
import { Breadcrumbs } from '@ids-group-ltd/ids-design-system';

/** Four levels — the leaf is the current page, bold and non-interactive. */
export const Default = () => (
  <Breadcrumbs
    items={[
      { label: 'Workspace', href: '/' },
      { label: 'Shipments', href: '/shipments' },
      { label: 'Leeds North depot', href: '/shipments/leeds-north' },
      { label: 'SHP-20481' },
    ]}
  />
);

/** Long trail collapsed to root · … · parent · leaf — the middle "…" is a
 *  plain non-clickable crumb. */
export const CollapsedTrail = () => (
  <Breadcrumbs
    items={[
      { label: 'Workspace', href: '/' },
      { label: '…' },
      { label: 'Return orders', href: '/clients/acme/returns' },
      { label: 'RMA-3317' },
    ]}
  />
);

/** Crumbs can carry a leading icon; an icon-only root works too. */
export const WithIcons = () => (
  <Breadcrumbs
    items={[
      { icon: 'home', href: '/' },
      { label: 'Depots', href: '/depots', icon: 'map' },
      { label: 'Manchester M1 2WD' },
    ]}
  />
);

/** separator swaps the glyph between crumbs (default chevronRight). */
export const CustomSeparator = () => (
  <Breadcrumbs
    separator="arrowRight"
    items={[
      { label: 'Workspace', href: '/' },
      { label: 'Fleet', href: '/fleet' },
      { label: 'Trailers', href: '/fleet/trailers' },
      { label: 'T-208' },
    ]}
  />
);

/** clickable={false} — read-only trail for audit logs and archived snapshots. */
export const NonClickable = () => (
  <Breadcrumbs
    clickable={false}
    items={[
      { label: 'Archive', href: '/archive' },
      { label: '2025 deliveries', href: '/archive/2025' },
      { label: 'POD-118204' },
    ]}
  />
);
