import * as React from 'react';
import { Pagination } from '@ids-group-ltd/ids-design-system';

/** Range label + windowed pages + size select — the full default row. */
export const Default = () => (
  <Pagination total={120} pageSize={10} currentPage={2} onCurrentPageChange={() => {}} />
);

/** Mid-range window: 1 … 11 12 13 … 24 — both ellipses visible. */
export const MidRange = () => (
  <Pagination
    total={240}
    pageSize={10}
    currentPage={12}
    onCurrentPageChange={() => {}}
    showLabel={false}
  />
);

/** Boundary states — previous disabled on page 1, next disabled on the last. */
export const Boundaries = () => (
  <div style={{ display: 'grid', gap: 12 }}>
    <Pagination total={40} pageSize={10} currentPage={1} onCurrentPageChange={() => {}} showLabel={false} />
    <Pagination total={40} pageSize={10} currentPage={4} onCurrentPageChange={() => {}} showLabel={false} />
  </div>
);

/** Page-size dropdown open (inline, no portal) — current size ticked.
 *  The effect click is a bridge for bundles compiled before the binding's
 *  `sizeSelectOpen` prop landed; the aria-expanded guard makes it a no-op
 *  once the prop takes effect. */
export const SizeSelectOpen = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const btn = ref.current?.querySelector<HTMLButtonElement>('button[role="combobox"]');
    if (btn && btn.getAttribute('aria-expanded') !== 'true') btn.click();
  }, []);
  return (
    <div ref={ref}>
      <Pagination
        total={500}
        pageSize={25}
        currentPage={3}
        onCurrentPageChange={() => {}}
        showLabel={false}
      />
    </div>
  );
};
