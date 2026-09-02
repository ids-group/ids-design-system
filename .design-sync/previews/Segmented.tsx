import * as React from 'react';
import { Segmented } from '@ids-group-ltd/ids-design-system';

/** One-of-many view switch (role="radiogroup") — the canonical use. */
export const Views = () => (
  <Segmented
    ariaLabel="View mode"
    value="list"
    options={[
      { label: 'List', value: 'list' },
      { label: 'Board', value: 'board' },
      { label: 'Calendar', value: 'calendar' },
    ]}
  />
);

/** Optional per-segment icons. */
export const WithIcons = () => (
  <Segmented
    ariaLabel="Fleet view"
    value="map"
    options={[
      { label: 'List', value: 'list', icon: 'list' },
      { label: 'Map', value: 'map', icon: 'map' },
      { label: 'Activity', value: 'activity', icon: 'activity' },
    ]}
  />
);

/** Disabled segments stay visible but can't be selected (keyboard nav skips them). */
export const DisabledSegment = () => (
  <Segmented
    ariaLabel="Depot filter"
    value="all"
    options={[
      { label: 'All depots', value: 'all' },
      { label: 'Leeds LS1', value: 'leeds' },
      { label: 'Glasgow G2', value: 'glasgow', disabled: true },
    ]}
  />
);
