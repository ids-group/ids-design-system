import * as React from 'react';
import { Radio, RadioGroup } from '@ids-group-ltd/ids-design-system';

const col: React.CSSProperties = { display: 'grid', gap: 24, width: 340 };

/** Group label + hint above/below the options; selection comes from the group value. */
export const Basic = () => (
  <div style={col}>
    <RadioGroup label="Service level" hint="Prices are per parcel, ex VAT." value="next-day">
      <Radio value="next-day" label="Next day before 10:30" />
      <Radio value="end-of-day" label="Next day by end of day" />
      <Radio value="standard" label="Standard (2–3 working days)" />
    </RadioGroup>
  </div>
);

/** Invalid group — error styling on the hint when no valid choice is made. */
export const Validation = () => (
  <div style={col}>
    <RadioGroup label="Collection depot" hint="Choose a depot to release the order." invalid>
      <Radio value="leeds" label="Leeds — Cross Green" />
      <Radio value="birmingham" label="Birmingham — Aston" />
      <Radio value="bristol" label="Bristol — Avonmouth" />
    </RadioGroup>
  </div>
);

/** Whole-group disabled — every option locked, selection preserved. */
export const Disabled = () => (
  <div style={col}>
    <RadioGroup label="Billing account" hint="Managed by your account administrator." value="ids-ops" disabled>
      <Radio value="ids-ops" label="IDS Operations Ltd" />
      <Radio value="ids-freight" label="IDS Freight (EU) B.V." />
    </RadioGroup>
  </div>
);
