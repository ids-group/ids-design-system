# DS Components — registry

Registry of components from `CLAUDE_DESIGN_DS` source. Ported components live in subfolders here. Unported components are listed below with their source class references so future ports can find them quickly.

## Ported (Phase 2A — 22 components)

| Component | Selector | Source ref |
|---|---|---|
| Icon | `ds-icon` | `ds-icons.jsx` (75 named SVG fragments) |
| Button | `ds-button` | `components.css` §BUTTON |
| Badge | `ds-badge` | `components.css` §BADGE — defect 5 status pills unified |
| StatusDot | `ds-status-dot` | `components.css` `.status-dot` |
| Avatar | `ds-avatar` | `components.css` §AVATAR |
| AvatarGroup | `ds-avatar-group` | `components.css` `.avatar-group` (shares avatar SCSS) |
| Card | `ds-card` | `components.css` §CARD |
| Stat | `ds-stat` | `components.css` §STAT |
| Tabs / Tab | `ds-tabs` / `ds-tab` | `components.css` §TABS |
| Input | `ds-input` | `components.css` §FIELD (text input subset) |
| Search | `ds-search` | `components.css` §SEARCH — defect 11 (BEM elements added) |
| Select | `ds-select` | `components.css` §FIELD (select subset) |
| Table | `ds-table` | `components.css` §TABLE — defect 9 (bulk-bar BEM) |
| Pagination | `ds-pagination` | `components.css` §PAGINATION |
| DatePicker | `ds-date-picker` | `components-overlay.jsx` §DATEPICKER (CDK Overlay) |
| Breadcrumbs | `ds-breadcrumbs` | `components.css` `.crumbs` |
| Sidenav family | `ds-sidenav`, `ds-sidenav-group`, `ds-sidenav-item` | `components.css` §SIDENAV — defect 4 partial (`.sidenav__item` canonical) |
| TopBar | `ds-topbar` | `components.css` §TOPBAR |
| PageHeader | `ds-page-header` | `components-extras.css` `.page-hdr` — defect 4 (canonical version) |
| Modal | `ds-modal` | `components.css` §MODAL + extras `.modal--danger` — defects 2, 6 |
| Banner | `ds-banner` | `components.css` §BANNER — defect 10 |
| Dropzone | `ds-dropzone` | `components-extras.css` §DROPZONE — defect 8 |

## Unported (registry only — port when needed)

Each entry points at the source CSS class so a future porter can find the rules quickly.

| Component | Source |
|---|---|
| Accordion | `ds-components-content.jsx` `.accordion` |
| Drawer | `ds-components-overlay.jsx` `.drawer` |
| Toast | `ds-components-overlay.jsx` `.toast` |
| Tooltip | `ds-components-overlay.jsx` `.tooltip` |
| Popover | `ds-components-overlay.jsx` (semantic HTML, no formal BEM in source) |
| Menu (dropdown) | `components-extras.css` `.menu` |
| EmptyState | `ds-components-overlay.jsx` `.empty` |
| Progress | `ds-components-overlay.jsx` `.progress` |
| Spinner | `ds-components-overlay.jsx` `.spinner` |
| Skeleton | `ds-components-overlay.jsx` `.skeleton` (small subset is inlined in Table) |
| Stepper | `ds-components-overlay.jsx` `.stepper` |
| Wizard | `components-extras.css` `.wizard` (composes Stepper) |
| Combobox | `ds-components-overlay.jsx` `.combo__list`, `.combo__option` |
| CommandPalette (⌘K) | `ds-components-overlay.jsx` `.cmdk` |
| Tag | `ds-components-form.jsx` `.tag` |
| Switch | `ds-components-form.jsx` `.switch` |
| Checkbox | `ds-components-form.jsx` `.check` (one-off inline use is in Table) |
| Radio | `ds-components-form.jsx` `.radio` |
| Textarea | `ds-components-form.jsx` `.field__textarea` |
| Slider | `ds-components-form.jsx` `.slider` |
| Segmented | `ds-components-form.jsx` `.segmented` |
| Link | `components-extras.css` `.link` (distinct from inline text link) |
| W3w | `ds-components-form.jsx` `.geo-pill` (renamed: explicit what3words token, not generic geo-pill) |
| InlineEdit | `components-extras.css` `.inline-edit` |
| Settings layout | `components-extras.css` `.settings__nav`, `.settings__panel`, `.settings__row` |
| Matrix | `components-extras.css` `.matrix` |
| Calendar | `components-extras.css` `.calendar` |
| BinPack viz | `components-extras.css` `.binpack` |
| MapPlaceholder | `components-extras.css` `.map-ph` |
| QR placeholder | `components-extras.css` `.qr` |
| Chart | `components-extras.css` `.chart` + `_tokens-charts.scss` |
| Page footer | `components.css` `.page-ftr` |
| Activity (pattern) | `components.css` `.activity` — shipped as a CSS pattern, not its own component |

## Convention

Each component subfolder contains:

```
<name>/
├── <name>.types.ts             # TS types (optional if component has none)
├── <name>.component.scss       # styles (idiomatic names, no BEM, SCSS nesting)
├── <name>.component.ts         # standalone Angular component, signals API
├── <name>.component.html       # template
├── <name>.stories.ts           # Storybook stories
└── index.ts                    # re-exports
```

Global stylesheets in `../styles/` (tokens, typography, layout-utils, scrollbar, icon-base, link) remain — they ship base classes (`.t-*`, `.grid-*`, `.link`, `.icon-base`). Forced-state demo helpers (`.is-forced-hover`/`-active`/`-focus`/`-disabled`) live in `prototype/ds-docs/src/styles/_forced-states.scss` — docs-only.
