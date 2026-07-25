import * as React from 'react';
import {
  Badge,
  Breadcrumbs,
  Button,
  Icon,
  PageHeader,
  Tab,
  Tabs,
} from '@ids-group-ltd/ids-design-system';

/** Full composition — breadcrumb trail above the eyebrow/title/subtitle
 *  stack, secondary + primary actions on the trailing edge, bottom divider. */
export const Canonical = () => (
  <PageHeader
    eyebrow="Depot · North region"
    title="Leeds North depot"
    subtitle="Kirkstall Road LS4 2AB · 32 dock doors · 4 delivery runs today"
    divider
    breadcrumbs={
      <Breadcrumbs
        items={[
          { label: 'Workspace', href: '/' },
          { label: 'Depots', href: '/depots' },
          { label: 'Leeds North' },
        ]}
      />
    }
    actions={
      <>
        <Button color="neutral" variant="outline" icon="archive">
          Archive
        </Button>
        <Button color="neutral" variant="outline" icon="download">
          Export
        </Button>
        <Button icon="plus">New shipment</Button>
      </>
    }
  />
);

/** Lifecycle pill inline with the title plus a `.meta-item` icon+text row
 *  under the subtitle (`metaDivider` rules the row off from the subtitle). */
export const WithMeta = () => (
  <PageHeader
    title="ORD-2026-0142"
    subtitle="14 pallets · Leeds LS1 4AP → Manchester M1 2AB"
    metaDivider
    titleBadge={<Badge withDot>In transit</Badge>}
    meta={
      <>
        <span className="meta-item">
          <Icon name="truck" size={16} />
          Driver Amelia Barnes
        </span>
        <span className="meta-item">
          <Icon name="calendar" size={16} />
          Departed 24 Jul 06:40
        </span>
        <span className="meta-item">
          <Icon name="clock" size={16} />
          ETA 11:15
        </span>
      </>
    }
    actions={<Button icon="edit">Edit order</Button>}
  />
);

/** Tabs strip below the title row. `divider` is left on to show the
 *  `:has(> [tabs])` contract: the header suppresses its own rule because
 *  the strip supplies the border. */
export const WithTabs = () => (
  <PageHeader
    title="Manchester M1 hub"
    subtitle="Store Street M1 2WD · 18 dock doors"
    divider
    actions={
      <>
        <Button color="neutral" variant="outline" icon="download">
          Export
        </Button>
        <Button icon="plus">Add run</Button>
      </>
    }
    tabs={
      <Tabs scrollable>
        <Tab label="Overview" />
        <Tab label="Shipments" count={32} />
        <Tab label="Drivers" />
        <Tab label="Dock schedule" />
        <Tab label="Activity" />
      </Tabs>
    }
  />
);

/** compact — tighter spacing, smaller single-line title with inline actions;
 *  index pages and dialog headers. */
export const Compact = () => (
  <PageHeader
    compact
    title="Shipments"
    actions={
      <>
        <Button color="neutral" variant="outline" icon="filter">
          Filters
        </Button>
        <Button icon="plus">New shipment</Button>
      </>
    }
  />
);
