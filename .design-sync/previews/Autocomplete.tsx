import * as React from 'react';
import {
  Autocomplete,
  type AutocompleteOption,
  type AutocompleteOptionGroup,
} from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 16, width: 340 };
const fieldLabel: React.CSSProperties = { fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' };

const drivers: AutocompleteOption<string>[] = [
  { label: 'Amelia Barnes', value: 'ab' },
  { label: 'Ravi Chauhan', value: 'rc' },
  { label: 'Tomasz Kowalski', value: 'tk' },
  { label: 'Priya Nair', value: 'pn' },
  { label: 'Callum Doyle', value: 'cd' },
];

const services: AutocompleteOption<string>[] = [
  { label: 'Next day before 10:30', value: 'nd-1030' },
  { label: 'Next day end of day', value: 'nd-eod' },
  { label: 'Two-day economy', value: 'econ-2d' },
  { label: 'Same-day courier', value: 'same-day' },
  { label: 'Saturday delivery', value: 'sat' },
];

const depotGroups: AutocompleteOptionGroup<string>[] = [
  {
    label: 'North',
    options: [
      { label: 'Leeds North', value: 'lds' },
      { label: 'Manchester Trafford', value: 'man' },
      { label: 'Newcastle Byker', value: 'ncl' },
    ],
  },
  {
    label: 'Midlands',
    options: [
      { label: 'Birmingham Hub', value: 'bhx' },
      { label: 'Nottingham Colwick', value: 'not' },
    ],
  },
  {
    label: 'South',
    options: [
      { label: 'Bristol Avonmouth', value: 'brs' },
      { label: 'Croydon Gateway', value: 'cro' },
    ],
  },
];

/** Single-select: empty with placeholder + hint, and a picked value. */
export const Basic = () => (
  <div style={col}>
    <div>
      <span style={fieldLabel}>Assigned driver</span>
      <Autocomplete placeholder="Pick a driver…" hint="Start typing to filter the roster." options={drivers} />
    </div>
    <div>
      <span style={fieldLabel}>Assigned driver</span>
      <Autocomplete placeholder="Pick a driver…" value="ab" options={drivers} />
    </div>
  </div>
);

/** Multiple: selections render as removable tags; the open panel shows checkbox rows. */
export const Multiple = () => (
  <div style={col}>
    <div>
      <span style={fieldLabel}>Offered services</span>
      <Autocomplete
        placeholder="Add service…"
        multiple
        value={['nd-1030', 'econ-2d']}
        options={services}
      />
    </div>
  </div>
);

/** Typed query filters the list; allowCreate adds a "Create «…»" row when nothing matches exactly. */
export const OpenFiltered = () => (
  <div style={col}>
    <div>
      <span style={fieldLabel}>Service level</span>
      <Autocomplete placeholder="Search services…" allowCreate options={services} />
    </div>
  </div>
);

/** Grouped options render labelled sections; empty groups are hidden while filtering. */
export const OpenGrouped = () => (
  <div style={col}>
    <div>
      <span style={fieldLabel}>Destination depot</span>
      <Autocomplete placeholder="Search depots…" value="bhx" options={depotGroups} />
    </div>
  </div>
);

/** Error and disabled treatments, plus width="content" for filter toolbars. */
export const States = () => (
  <div style={col}>
    <div>
      <span style={fieldLabel}>Assigned driver</span>
      <Autocomplete placeholder="Pick a driver…" invalid hint="A driver is required to dispatch." options={drivers} />
    </div>
    <div>
      <span style={fieldLabel}>Assigned driver</span>
      <Autocomplete placeholder="Pick a driver…" value="rc" disabled options={drivers} />
    </div>
    <div style={{ display: 'flex', gap: 8 }}>
      <Autocomplete width="content" placeholder="Service…" value="same-day" options={services} />
      <Autocomplete width="content" placeholder="Driver…" options={drivers} />
    </div>
  </div>
);
