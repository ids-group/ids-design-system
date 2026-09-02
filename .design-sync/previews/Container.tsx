import * as React from 'react';
import { Card, Container } from '@ids-group-ltd/ids-design-system';

const strip = (label: string) => (
  <div
    style={{
      padding: '10px 12px',
      background: 'var(--surface-secondary)',
      border: '1px dashed var(--border-default)',
      borderRadius: 6,
      font: '500 13px/1.4 var(--font-sans)',
      color: 'var(--text-secondary)',
      textAlign: 'center',
    }}
  >
    {label}
  </div>
);

/** Width caps per `size` — the tinted strip fills the container, so its edges
 *  show the cap + the clamped x-padding. Block-flow wrapper on purpose: the
 *  container centers itself with `margin-inline: auto`, and inside a flex/grid
 *  parent those auto margins would shrink-wrap it instead. (lg/xl cap at
 *  1024/1280px — wider than this card, so they render like `full` here.) */
export const Sizes = () => (
  <div style={{ background: 'var(--surface-sunken, var(--surface-secondary))', padding: '16px 0', borderRadius: 8 }}>
    <Container size="sm">{strip('size="sm" — caps at 640px, centered')}</Container>
    <div style={{ height: 16 }} />
    <Container size="md">{strip('size="md" — caps at 768px')}</Container>
    <div style={{ height: 16 }} />
    <Container size="full">{strip('size="full" — no cap, padding only')}</Container>
  </div>
);

/** Typical page scaffold — a md container centering real page content. */
export const PageContent = () => (
  <Container size="md">
    <div className="t-overline">Depot report</div>
    <h3 className="t-h4" style={{ margin: '4px 0' }}>
      Leeds central depot — week 30
    </h3>
    <p className="t-s" style={{ margin: '0 0 12px', color: 'var(--text-secondary)' }}>
      Throughput held at 1,240 pallets across 86 trunk runs. Two delayed
      departures on Thursday due to M62 congestion; both recovered same-day.
    </p>
    <Card elevation="raised" padding="md">
      <div className="t-overline">Utilisation</div>
      <h4 className="t-h5" style={{ margin: '4px 0' }}>
        Dock doors 92% · Fleet 18 of 22
      </h4>
      <p className="t-s" style={{ margin: 0 }}>
        Peak window 06:00–09:40 · quietest bay: 7 (rear yard)
      </p>
    </Card>
  </Container>
);
