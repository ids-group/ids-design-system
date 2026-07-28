# IDS Design System — build conventions

React bindings over the IDS Group Angular design system's real compiled CSS. Components render `ds-*` host elements (e.g. `<ds-button>`) carrying the library's exact markup — **never hand-write DS internals** like `<button class="button md">`; always use the exported component.

## Handing off to Angular

The shipping library is **Angular**; these React components exist so designs render its real markup and CSS. Engineers translate what you build here, so stay on the mapping and it stays mechanical:

- component → its host tag: `<Button>` → `<ds-button>`, `<SidenavFooter>` → `<ds-sidenav-footer>`
- prop → input of the same name, camelCase kept (Angular templates are case-sensitive): `color="error"`, and booleans as bare attributes — `<ds-button fullWidth loading>`
- `on<Event>` → output: `onPressed` → `(pressed)`, `onClosed` → `(closed)`; `onValueChange` pairs with `value` as `[(value)]`
- `children` → `<ng-content>`; a named node prop (`actions`, `subtext`, `impact`) → the same slot attribute, e.g. `<div actions>`

Anything with no Angular counterpart can't be handed off — if a prop isn't in the component's `<Name>.d.ts`, don't invent it.

## Setup
- **No provider or wrapper is required.** Tokens, fonts (self-hosted Mulish + JetBrains Mono), and all component styles come from `styles.css`.
- **Theming:** light is the default at bare `:root`. Dark = set `data-theme="dark"` on `<html>`. Brand-tinted grays = `data-neutrals="brand"`. There is no automatic OS switch.
- **Accent zones:** wrap any region in `ds-color="secondary" | "tertiary" | "error" | "success" | "warning"` (attribute on a plain div) and accent-following components inside (default Buttons, focus rings) adopt that hue.

## Styling idiom
Token-based CSS custom properties — **no utility-class framework**. Components style themselves via props (`color`, `variant`, `size`, `tone`); style YOUR layout glue with plain CSS/inline styles using the tokens:
- Space: `var(--space-1)` … `var(--space-8)` (4px scale; `--space-2`=8px, `--space-4`=16px)
- Surfaces: `var(--surface-canvas)` (page), `var(--surface-default)` (cards), `var(--surface-secondary)`, `var(--surface-muted)`, `var(--surface-overlay)`
- Text: `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`, `var(--text-muted)`, `var(--text-link)`
- Borders/radii: `var(--border-default)`, `var(--radius-md)`, `var(--radius-pill)`
- Fonts/shadows: `var(--font-sans)`, `var(--font-mono)`, `var(--shadow-card)`, `var(--shadow-modal)`, `var(--shadow-popover)`
- Global typography classes (public API): `.t-h1`…`.t-h4`, `.t-s`, `.t-caption`, `.t-overline`, `.t-mono-inline`; link-styled actions use `.link` (canonical — preferred over `<Button variant="text">`).
- Prefer the layout primitives `Stack`, `Inline`, `Container` over ad-hoc flex wrappers where they fit.

## Component conventions
- **Controlled-with-fallback state:** pass a state prop alone (`value`, `open`, `pressed`, `expanded`) to seed it statically; add the matching `on*Change` callback for controlled behavior. Overlays (Modal/Drawer/BottomSheet/Select/Menu/Popover/Tooltip) render their open state **inline — no portals**; Modal additionally has `staticPreview` for embedding a modal in-flow (mockups).
- **Statuses ship empty by design:** `Badge`/`StatusDot` `status` keys color nothing until you wire them — set `--ds-badge-bg-color`/`--ds-badge-label-color`/`--ds-status-dot-color` on a wrapper or via `[data-status="…"]` CSS.
- Icons: `<Icon name="truck" size={20}/>` — 85 built-in stroke names (see Icon.prompt.md); `currentColor`.
- Events use DS names: `onPressed` (Button family), `onClosed` (dismissibles), `onValueChange` (inputs). Dismissible components never hide themselves — the parent removes them.

## Where the truth lives
Read `styles.css` → `_ds_bundle.css` (token definitions at the top; per-component blocks labeled `/* ── <name>.component.scss (ds-<name>) ── */`), each component's `<Name>.d.ts` for the exact API, and `<Name>.prompt.md` for usage.

## Example
```tsx
import { Card, Stack, Input, Select, Button, Badge } from '@ids-group-ltd/ids-design-system';

<Card>
  <Stack gap="md">
    <span className="t-h4">New shipment</span>
    <Input label="Reference" placeholder="ORD-2026-0142" required />
    <Select label="Depot" value="leeds" options={[
      { value: 'leeds', label: 'Leeds LS1 4AP' },
      { value: 'bristol', label: 'Bristol BS1 5TR' },
    ]} />
    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
      <Badge withDot>In transit</Badge>
      <Button icon="plus">Create</Button>
      <button className="link" type="button">Save as draft</button>
    </div>
  </Stack>
</Card>
```
