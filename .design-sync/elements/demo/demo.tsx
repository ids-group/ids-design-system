// Local proof page for the elements approach. Every panel exercises something
// the hand-written React port explicitly cannot do (see .design-sync/NOTES.md
// "Intentionally not ported"): CDK-portaled overlays, focus trap, pointer-driven
// table interactions, hover tooltips, and real two-way model round-trips.
import * as React from 'react';
import { createRoot } from 'react-dom/client';
// Same reason as bundle-entry.tsx: re-export, don't just import for effect.
import * as angularElements from '../dist/browser/main.js';
// No Tooltip here on purpose: `dsTooltip` is an attribute DIRECTIVE, and a
// directive has no element to register — see README "Directives".
import {
  Button, Checkbox, Input, Modal, Select, Table, Card, Badge, Switch,
  Alert, Stat, Tabs, Tab, Menu, MenuItem, Popover, Icon, SplitButton,
} from '../gen';

const log: string[] = [];

function useEventLog() {
  const [, force] = React.useState(0);
  return (message: string) => {
    log.unshift(`${new Date().toLocaleTimeString()}  ${message}`);
    log.length = Math.min(log.length, 12);
    force((n) => n + 1);
  };
}

const rows = [
  { id: '1', ref: 'ORD-2026-0142', depot: 'Leeds LS1 4AP', weight: 1240, status: 'In transit' },
  { id: '2', ref: 'ORD-2026-0143', depot: 'Bristol BS1 5TR', weight: 860, status: 'Loading' },
  { id: '3', ref: 'ORD-2026-0144', depot: 'Glasgow G2 8DL', weight: 2010, status: 'Delivered' },
];

const columns = [
  { key: 'ref', label: 'Reference', sortable: true },
  { key: 'depot', label: 'Depot' },
  { key: 'weight', label: 'Weight (kg)', align: 'right', sortable: true },
  { key: 'status', label: 'Status' },
];

function Panel({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <Card padding="md" style={{ display: 'block' }}>
      <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
        <div>
          <div className="t-h5">{title}</div>
          <div className="t-caption" style={{ color: 'var(--text-secondary)' }}>{hint}</div>
        </div>
        {children}
      </div>
    </Card>
  );
}

function Demo() {
  const push = useEventLog();
  const [dark, setDark] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [agreed, setAgreed] = React.useState(false);
  const [depot, setDepot] = React.useState('leeds');
  const [sort, setSort] = React.useState('—');

  React.useEffect(() => {
    document.documentElement.toggleAttribute('data-theme', dark);
    if (dark) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }, [dark]);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-5)', padding: 'var(--space-5)', maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <span className="t-h3">IDS DS via @angular/elements</span>
        <Badge>real Angular, React props</Badge>
        <span style={{ flex: 1 }} />
        <Switch label="Dark theme" checked={dark} onCheckedChange={(value) => setDark(Boolean(value))} />
      </header>

      <Alert variant="info" title="What this page proves">
        Every control below is the shipped Angular component, upgraded into the tag a generated
        React wrapper rendered. Nothing here is a re-implementation.
      </Alert>

      <Panel title="Overlays through the real CDK" hint="ds-select opens a portaled panel — outside click and Escape close it, and the listbox is keyboard-navigable.">
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Select
            label="Depot"
            value={depot}
            options={[
              { value: 'leeds', label: 'Leeds LS1 4AP' },
              { value: 'bristol', label: 'Bristol BS1 5TR' },
              { value: 'glasgow', label: 'Glasgow G2 8DL' },
            ]}
            onValueChange={(value) => { setDepot(String(value)); push(`select → ${String(value)}`); }}
          />
          <Popover>
            <Button variant="outline" trailingIcon="chevronDown">Actions</Button>
            <Menu>
              <MenuItem label="Duplicate" onSelected={() => push('menu → duplicate')} />
              <MenuItem label="Archive" onSelected={() => push('menu → archive')} />
            </Menu>
          </Popover>
          <Popover>
            <Button variant="ghost" icon="info">Popover panel</Button>
            <Card padding="md" style={{ display: 'block', maxWidth: 260 }}>
              <span className="t-s">Positioned by the DS's own overlay service, not by the wrapper.</span>
            </Card>
          </Popover>
        </div>
      </Panel>

      <Panel title="A control whose own template nests custom elements" hint="ds-split-button renders ds-popover + ds-menu inside itself. Those register under ds-x- aliases, so the nested elements stay Angular components and the menu keeps its items — angular/angular#24536 otherwise empties it.">
        <SplitButton
          label="Save"
          menuLabel="More save options"
          menuItems={[
            { label: 'Save as…', value: 'save-as', icon: 'copy' },
            { label: 'Save a copy', value: 'copy' },
            { label: 'Discard changes', value: 'discard', icon: 'trash', error: true },
          ]}
          onPressed={() => push('split → save')}
          onItemSelected={(item) => push(`split → ${String((item as { value?: string }).value)}`)}
        />
      </Panel>

      <Panel title="Dialog with focus trap + scroll lock" hint="Tab cycles inside the dialog, Escape closes, the body stops scrolling — all CDK behaviour the port drops.">
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button onPressed={() => setModalOpen(true)}>Open dialog</Button>
          <Modal
            open={modalOpen}
            title="Confirm dispatch"
            onOpenChange={(value) => { setModalOpen(Boolean(value)); push(`modal open → ${String(value)}`); }}
          >
            <div body="">
              <p className="t-s">Sending 3 shipments to {depot}. This cannot be undone.</p>
              <Checkbox
                label="I have verified the manifest"
                checked={agreed}
                onCheckedChange={(value) => { setAgreed(Boolean(value)); push(`checkbox → ${String(value)}`); }}
              />
            </div>
            <div actions="">
              <Button variant="ghost" onPressed={() => setModalOpen(false)}>Cancel</Button>
              <Button disabled={!agreed} onPressed={() => { setModalOpen(false); push('dispatch confirmed'); }}>
                Dispatch
              </Button>
            </div>
          </Modal>
          <span className="t-caption" style={{ alignSelf: 'center', color: 'var(--text-secondary)' }}>
            manifest verified: {String(agreed)}
          </span>
        </div>
      </Panel>

      <Panel
        title="Same dialog, staticPreview"
        hint="staticPreview is a host-directive input the generator now picks up. It renders the card in flow AT VIEW CREATION — which is exactly why its projected children survive."
      >
        <Modal staticPreview title="Confirm dispatch">
          <div body="">
            <p className="t-s">Sending 3 shipments. Projected through `[body]`.</p>
          </div>
          <div actions="">
            <Button variant="ghost">Cancel</Button>
            <Button>Dispatch</Button>
          </div>
        </Modal>
      </Panel>

      <Panel title="Table with live sorting" hint="Click a sortable header: the Angular component sorts and emits, React just listens.">
        <Table
          caption="Active shipments"
          data={rows}
          columns={columns}
          clientSort
          selectable
          onSortChange={(event) => { const e = event as { key?: string; dir?: string }; setSort(`${e?.key ?? '—'} ${e?.dir ?? ''}`); push(`sort → ${e?.key} ${e?.dir}`); }}
        />
        <span className="t-caption" style={{ color: 'var(--text-secondary)' }}>last sort event: {sort}</span>
      </Panel>

      <Panel title="Tabs, stats, inputs" hint="Ordinary composition — the point is that props and named slots survive the wrapper.">
        <Tabs>
          <Tab label="Summary">
            <div style={{ display: 'flex', gap: 'var(--space-4)', paddingTop: 'var(--space-3)' }}>
              <Stat label="In transit" value="18" />
              <Stat label="Delayed" value="2" variant="error" />
            </div>
          </Tab>
          <Tab label="Details">
            <div style={{ paddingTop: 'var(--space-3)', display: 'grid', gap: 'var(--space-3)', maxWidth: 360 }}>
              <Input label="Reference" placeholder="ORD-2026-0142" required />
              <Input label="Password" type="password" passwordToggle value="hunter2" />
            </div>
          </Tab>
        </Tabs>
      </Panel>

      <Panel title="Event log" hint="Outputs arrive as CustomEvents; the wrapper forwards event.detail to the React callback.">
        <pre style={{
          margin: 0, padding: 'var(--space-3)', background: 'var(--surface-secondary)',
          borderRadius: 'var(--radius-md)', font: 'var(--font-size-xs)/1.6 var(--font-mono)',
          maxHeight: 220, overflow: 'auto',
        }}>
          {log.length ? log.join('\n') : 'interact with anything above…'}
        </pre>
      </Panel>

      <footer className="t-caption" style={{ color: 'var(--text-tertiary)', display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <Icon name="info" size={14} />
        {Object.keys(window as unknown as Record<string, unknown>).includes('IdsDs')
          ? 'window.IdsDs present'
          : 'demo build (wrappers imported directly)'}
      </footer>
    </div>
  );
}

Object.assign(window, { __angularElements: angularElements });
createRoot(document.getElementById('root')!).render(<Demo />);
