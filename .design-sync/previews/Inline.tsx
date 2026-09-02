import * as React from 'react';
import { Inline } from '@ids-group-ltd/ids-design-system';

const chip = (label: string, height?: number) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      height,
      padding: '6px 12px',
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

/** Named gaps map to the spacing scale; unset falls back to the semantic
 *  `--space-inline` (8px). */
export const Gaps = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    {(['xs', 'md', 'xl'] as const).map((gap) => (
      <div key={gap}>
        {caption(`gap="${gap}"`)}
        <Inline gap={gap}>
          {chip('Leeds')}
          {chip('Manchester')}
          {chip('Sheffield')}
          {chip('Carlisle')}
        </Inline>
      </div>
    ))}
  </div>
);

/** Cross-axis alignment of unequal-height children; the component default is
 *  center. */
export const AlignAxis = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    {(['start', 'center', 'end'] as const).map((align) => (
      <div key={align}>
        {caption(`align="${align}"`)}
        <Inline gap="sm" align={align}>
          {chip('Driver', 32)}
          {chip('Amelia Barnes', 48)}
          {chip('HGV Class 1', 64)}
        </Inline>
      </div>
    ))}
  </div>
);

/** Main-axis distribution inside a fixed-width row — `between` is the toolbar
 *  staple. */
export const JustifyAxis = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    {(['between', 'center', 'end'] as const).map((justify) => (
      <div key={justify}>
        {caption(`justify="${justify}"`)}
        <div style={{ width: 460, border: '1px dashed var(--border-default)', borderRadius: 8, padding: 8 }}>
          <Inline gap="sm" justify={justify}>
            {chip('ORD-2026-0142')}
            {chip('14 pallets')}
            {chip('ETA 14:30')}
          </Inline>
        </div>
      </div>
    ))}
  </div>
);

/** Wraps by default; `wrap={false}` keeps one line and lets content overflow
 *  its clipped frame instead. */
export const Wrapping = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    <div>
      {caption('wrap (default) — 320px frame')}
      <div style={{ width: 320, border: '1px dashed var(--border-default)', borderRadius: 8, padding: 8 }}>
        <Inline gap="sm">
          {chip('EC1A 1BB')}
          {chip('LS1 4AP')}
          {chip('M1 2AB')}
          {chip('S1 2HE')}
          {chip('BS1 5TR')}
          {chip('G1 3SL')}
        </Inline>
      </div>
    </div>
    <div>
      {caption('wrap={false} — single line, clipped at the frame')}
      <div style={{ width: 320, border: '1px dashed var(--border-default)', borderRadius: 8, padding: 8, overflow: 'hidden' }}>
        <Inline gap="sm" wrap={false}>
          {chip('EC1A 1BB')}
          {chip('LS1 4AP')}
          {chip('M1 2AB')}
          {chip('S1 2HE')}
          {chip('BS1 5TR')}
          {chip('G1 3SL')}
        </Inline>
      </div>
    </div>
  </div>
);
