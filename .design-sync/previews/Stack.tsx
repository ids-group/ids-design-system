import * as React from 'react';
import { Stack } from '@ids-group-ltd/ids-design-system';

/** Bordered block so the gap/alignment axes read visually. */
const box = (label: string, width?: number) => (
  <div
    style={{
      width,
      padding: '8px 12px',
      background: 'var(--surface-secondary)',
      border: '1px solid var(--border-default)',
      borderRadius: 6,
      font: '500 13px/1.4 var(--font-sans)',
      color: 'var(--text-secondary)',
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </div>
);

const caption = (text: string) => (
  <div className="t-caption" style={{ marginBottom: 8 }}>
    {text}
  </div>
);

/** Named gaps map to the spacing scale (xs=4 … xl=32); unset falls back to
 *  the semantic `--space-stack` (16px). */
export const Gaps = () => (
  <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
    {(['xs', 'md', 'xl'] as const).map((gap) => (
      <div key={gap}>
        {caption(`gap="${gap}"`)}
        <Stack gap={gap}>
          {box('Pick note')}
          {box('Load list')}
          {box('Manifest')}
        </Stack>
      </div>
    ))}
  </div>
);

/** Cross-axis alignment of unequal-width children; unset keeps the flex
 *  default (stretch). */
export const Align = () => (
  <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
    {(['start', 'center', 'end'] as const).map((align) => (
      <div key={align} style={{ width: 220, border: '1px dashed var(--border-default)', borderRadius: 8, padding: 12 }}>
        {caption(`align="${align}"`)}
        <Stack gap="sm" align={align}>
          {box('Depot', 80)}
          {box('Leeds LS1 4AP', 140)}
          {box('Bay 12 · dock door 4', 190)}
        </Stack>
      </div>
    ))}
  </div>
);
