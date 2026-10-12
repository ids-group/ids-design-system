# DS Component Catalogue

> Index of the design system components, global helpers, tokens and icons. Use it as a single reference when migrating UI to DS.
>
> **If you are an agent, read `docs/agent/INDEX.md` instead of this file.** The same content
> is generated there as an index plus one leaf per entry, so answering a question about one
> component costs ~1.6 KB and the index, not the 58 KB of this catalogue. This file stays the
> single place a human edits — the leaves are derived from it and a CI gate fails when they
> drift.
>
> **This file is the WHAT — the inventory.** For the HOW (which spacing between what,
> which type role where, how a page is composed) see `design-system.md`, which carries
> the rules this catalogue deliberately does not.
>
> **Where it overlaps with generated output:** the documentation site
> (https://ids-ds.proto.ids-group.co.uk/) carries a generated Component API table and
> a token reference from source on every build, and those cannot go stale. Where this file
> and the generated tables disagree, the generated ones are right — prefer them for exact inputs and token names, and
> use this catalogue for orientation. Each entry shows the selector, the key inputs/outputs/slots, and the public CSS custom properties that consumers can override.
>
> **Import path:** `import { ButtonComponent, … } from '@ids-group-ltd/ids-design-system'`.
>
> **Templating note:** every component is standalone with `ViewEncapsulation.Emulated`. Pass classes on the host element to scope local tweaks; override DS tokens at the host level (`ds-xxx { --ds-xxx-…: … }`) — defaults are declared on `:host` (or the root class) so consumer overrides cascade in.

---

## Foundations

### Tokens (Tier 2 — semantic roles)

Loaded via `@use 'styles/tokens';` (when the consumer also `@use 'styles/ds';` the full aggregate is pulled in). Brand themes override Tier 1 palette + a few Tier 2 roles in their own `_brand-*.scss`.

**Colour roles:**
- Surfaces: `--surface-canvas`, `--surface-default`, `--surface-secondary`, `--surface-overlay`, `--surface-tint`, `--surface-disabled`, `--surface-muted`, `--surface-inverted`, `--surface-inverted-hover`, `--surface-scrim`
- Borders: `--border-default`, `--border-strong`, `--border-subtle`, `--border-divider`, `--border-disabled`, `--border-inverted`
- Text: `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-muted`, `--text-disabled`, `--text-inverted`, `--text-link`, `--text-on-primary`, `--text-on-success`, `--text-on-error`
- Icons: `--icon-default`, `--icon-strong`, `--icon-muted`, `--icon-on-primary`
- Primary (main brand fill): `--primary`, `--primary-hover`, `--primary-pressed`, `--primary-selected-hover`, `--primary-strong`, `--primary-subtle`, `--primary-muted`, `--primary-muted-strong`, `--primary-on` + HSL channels `--primary-h/s/l`
- Secondary (paired CTAs, accent rails, opt-in variants): `--secondary`, `--secondary-hover`, `--secondary-pressed`, `--secondary-strong`, `--secondary-subtle`, `--secondary-muted`, `--secondary-on` + HSL channels `--secondary-h/s/l`
- Tertiary (third brand hue — tertiary button, tonal chips, indicators): `--tertiary`, `--tertiary-hover`, `--tertiary-pressed`, `--tertiary-strong`, `--tertiary-subtle`, `--tertiary-muted`, `--tertiary-on` + HSL channels `--tertiary-h/s/l`
- Error (destructive, was --danger): `--error`, `--error-hover`, `--error-pressed`, `--error-subtle`, `--error-muted`, `--error-highlight`, `--error-border`, `--error-text` + HSL channels `--error-h/s/l`
- Status: `--success`, `--success-hover`, `--success-subtle`, `--success-muted`, `--success-border`, `--success-text`
- Status (warning/info): same shape with prefix swapped
- Status pills: the DS ships no predefined status keys — consumers register their own vocabulary (e.g. `planning`, `confirmed`) and wire colours per key via `@use 'styles/status'` (`status.define(...)` / `status.semantic-preset`), which sets `--ds-badge-bg-color` / `--ds-badge-label-color` / `--ds-status-dot-color` per `[data-status]`. Full guide (model, worked example, migration from factory statuses): [`migrations/0.5.1/badge-statuses.md`](migrations/0.5.1/badge-statuses.md). `--ds-badge-font-size` sets the label size (default `--font-size-xs`; a `count` badge re-resolves it at `--font-size-2xs`, so the token reaches both).

**Geometry:**
- Spacing: `--space-0`, `--space-px`, `--space-0-5` (2px), `--space-1` (4px), `--space-1-5` (6px), `--space-2` (8px), `--space-2-5` (10px), `--space-3` (12px), `--space-4` (16px), `--space-5` (20px), `--space-6` (24px), `--space-8` (32px), `--space-10` (40px), `--space-12` (48px), `--space-14` (56px), `--space-16` (64px), `--space-20` (80px), `--space-24` (96px), `--space-32` (128px)
- Radius: `--radius-0`, `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (12px), `--radius-2xl` (24px), `--radius-pill` (999px), `--radius-pill-value`, `--radius-flat`
- Border widths: `--border-width-default` (1px), `--border-width-strong` (2px)
- Hit targets: `--hit-xs` (24), `--hit-sm` (28), `--hit-md` (36), `--hit-min` (32), `--hit-cozy` (40), `--hit-comfy` (44), `--hit-touch` (48)
- Icon sizes: `--icon-2xs` (10), `--icon-xs` (12), `--icon-sm` (14), `--icon-md` (16), `--icon-lg` (20)

**Typography:**
- Families: `--font-sans`, `--font-mono`, `--font-display`, `--font-heading`
- Weights: `--font-weight-regular` 400, `--font-weight-medium` 500, `--font-weight-semibold` 600, `--font-weight-bold` 700, `--font-weight-extrabold` 800 (a brand overlay may step this down to 700)
- Sizes: `--font-size-display` 64, `--font-size-h1` 48, `--font-size-h2` 36, `--font-size-h3` 28, `--font-size-h4` 22, `--font-size-h5` 18, `--font-size-h5-strong` 20, `--font-size-l` 18, `--font-size-m` 16, `--font-size-s` 14, `--font-size-xs` 12, `--font-size-2xs` 11, `--font-size-3xs` 10, `--font-size-4xs` 9, `--font-size-mono` 13
- Line heights: `--line-height-tight` 1.1, `--line-height-snug` 1.25, `--line-height-base` 1.4, `--line-height-loose` 1.6, `--line-height-flat` 1
- Letter spacing: `--letter-spacing-tight`, `--letter-spacing-snug`, `--letter-spacing-normal`, `--letter-spacing-wide`, `--letter-spacing-wider`

**Motion:**
- Durations: `--duration-instant` 80ms, `--duration-fast` 120ms, `--duration-base` 180ms, `--duration-slow` 260ms, `--duration-slower` 400ms
- Loop: `--duration-loop-fast` 700ms, `--duration-loop-slow` 1400ms
- Easing: `--ease-standard`, `--ease-emphasized`, `--ease-decelerate`, `--ease-accelerate`, `--ease-spring`

**Elevation:**
- `--z100/200/300/400` (raw), `--shadow-popover`, `--shadow-modal`, `--shadow-toast`, `--shadow-card`
- `--blur-sm`, `--blur-md`

**Z-index:**
- `--layer-base`, `--layer-raised`, `--layer-sticky`, `--layer-dropdown`, `--layer-overlay`, `--layer-drawer`, `--layer-modal`, `--layer-popover`, `--layer-toast`, `--layer-tooltip`

**Focus rings:** `--focus-ring`, `--focus-ring-inverted`, `--focus-ring-error`, `--focus-field`, `--focus-field-error`

---

### Grid

Responsive 4-tier page grid loaded via `@use 'styles/ds'` (or directly via `@use 'styles/page-grid';`). One column-count per breakpoint, gutters and margins scale with the viewport. The container caps at `--col-cap-content` (1280px) at every tier; it first binds above 1280px.

| Tier         | Range         | Cols | Gutter        | Margin         |
| ------------ | ------------- | ---- | ------------- | -------------- |
| Mobile       | < 640px       | 4    | `--space-3` (12)  | `--space-4` (16)   |
| Tablet       | 640-1023px    | 8    | `--space-4` (16)  | `--space-6` (24)   |
| Desktop      | 1024-1440px   | 12   | `--space-5` (20)  | `--space-8` (32)   |
| Desktop wide | ≥ 1441px      | 12   | `--space-6` (24)  | `--space-10` (40)  |

**Tokens:** `--bp-xs` 480, `--bp-sm` 640, `--bp-md` 768, `--bp-lg` 1024, `--bp-xl` 1441, `--bp-2xl` 1536. Per-tier gutters/margins live as `--page-gutter-{mobile|tablet|desktop|wide}` and `--page-margin-{mobile|tablet|desktop|wide}`; the active values resolve through `--page-gutter` / `--page-margin` on `.page-grid`. Content caps: `--col-cap-text` 720, `--col-cap-content` 1280.

**Class API:**
- `.page-grid` — root grid container. Sets `display: grid`, tier-appropriate `grid-template-columns`, `gap`, horizontal `padding`, and `max-width: var(--col-cap-content)` with `margin: 0 auto` for centring once the viewport exceeds the cap.
- `.col-span-1` … `.col-span-12` — span helpers. At narrower tiers (8 / 4 cols), a span wider than the active column-count wraps to its own row.

**Composition rules:**
- One grid per page. Sub-regions align to the same column tracks — never invent a local grid.
- Snap to columns, not pixels. Canonical two-column splits: 8+4, 6+6, 9+3. Never 7+5.
- Sidenav lives OUTSIDE the grid. Reserve its rail (collapsed 64px / open 240px via `--sidenav-w` / `--sidenav-w-collapsed`), then start `.page-grid` in the remaining width.
- Prose caps at 720px via `--col-cap-text` regardless of grid width.
- 8+4 is canonical for record-detail pages (main + meta sidebar); 9+3 is reserved for a narrow picker or filter rail.

**Markup example:**

```html
<main class="page-grid">
  <section class="col-span-8">Main content</section>
  <aside class="col-span-4">Meta sidebar</aside>
</main>
```

---

### Global helper classes

The DS aggregate (`@use 'styles/ds'`) forwards the full stack: theme primitives + tokens + tokens-charts + fonts + reset + typography + link + layout-utils + page-grid + scrollbar + icon-base + dropdown-overlay. Consumers that only `@use 'styles/tokens'` get pure tokens — **no** font faces, `.link`, typography utilities, `.grid-*`, `.page-grid` / `.col-span-*`, or the dropdown overlay rules — load each partial explicitly (`@use 'styles/fonts'; @use 'styles/link';` …) or switch to the aggregate.

- `.link` — anchor styling, declared in `_link.scss`. Modifiers: `.quiet` `.inline` `.standalone` `.plain` `.xs` `.sm` `.lg`. `.plain` drops the underline until hover or keyboard focus: for a link that stands on its own (a row action, a list of links), never for a link inside running text. Hover→`color-mix(text-link, black 20%)`, active→`color-mix(text-link, black 35%)`, disabled via `[aria-disabled="true"]`. Loaded via `@use 'styles/link'` (included in the `@use 'styles/ds'` aggregate).
- Typography utilities (`_typography.scss`): `.t-display`, `.t-h1`, `.t-h2`, `.t-h3`, `.t-h4`, `.t-h5`, `.t-l`, `.t-l-bold`, `.t-m`, `.t-m-bold`, `.t-s`, `.t-s-bold`, `.t-xs`, `.t-xs-bold`, `.t-overline`, `.t-caption`, `.t-mono`, `.t-mono-block`, `.sr-only`
- Layout (`_layout-utils.scss`): `.grid-2`, `.grid-3`, `.grid-4`. Breakpoints: at ≤1100px `.grid-4` drops to 3 columns; at ≤820px both `.grid-3` and `.grid-4` drop to 2 columns. Gap is `--space-4`.
- Page grid (`_page-grid.scss`): `.page-grid` + `.col-span-1` … `.col-span-12`. 4-tier responsive grid (4 / 8 / 12 / 12 columns); see Foundations → Grid above for the full spec.
- Dropdown overlay (`_dropdown-overlay.scss`): styles the `.ds-dropdown-panel` class used by select/dropdown/combobox/date-picker CDK portals — these panels live outside the host's encapsulated tree, so the styles must be global.

**Two mixins for building your own composite controls.** `@use` the partial directly to reach the mixin; a mixin emits nothing until it is included.

- `@use 'styles/focus' as focus;` → `focus.owns-the-focus-ring($control)`. The base indicator and the `data-focus` switch live in its `emit-rules` mixin, which `styles/ds` includes once, so reaching for a mixin adds no CSS. Include it in a shell that paints its own ring on `:focus-within`, naming the ONE control inside that must not paint the base indicator too. A plain `outline: 0` is not the same: the base indicator is an outline, and the mixin keeps it under forced colours, where the shell's box-shadow is dropped and nothing else would show focus. A box-wide reset instead of a named control silences the tab stops inside the box (a clear button, a stepper arrow), which leaves a keyboard user unable to tell what has focus. See Foundations → Colour → Focus for the worked example.
- `@use 'styles/pinned' as pinned;` → `pinned.cue($underline: true)`, `pinned.cue-hover($spread: 2px, $underline: true)`, `pinned.cue-pressed($spread: 2px, $underline: true)`. Mixin-only. The pinned-tooltip cue: `--accent-strong` ink and, for a text trigger, a 2px accent underline; `$underline: false` for an icon. Include inside `&[data-ds-tooltip-pinned]`, its `:hover` and its `:active`.
- `@use 'styles/text-clip' as text-clip;` → `text-clip.single-line-ellipsis`, `text-clip.inline-axis`, `text-clip.line-clamp($lines)`. Mixin-only, so this partial is NOT part of the `styles/ds` aggregate and emits nothing on its own. Use them instead of hand-writing `overflow: hidden` on a box that holds text: a glyph reaches past its line box by half the gap between the font's ascent plus descent and the line-height, so any block-axis clip cuts the ascenders and descenders of a font taller than its line box, and how much depends on the font you set. `single-line-ellipsis` truncates one line with an ellipsis and `inline-axis` clips a row of anything sideways; both leave the block axis `visible`, which changes no box size. `line-clamp($lines)` has to clip the block axis to hide the lines after the last, so it sets `line-height: normal`, the one value every font sizes to its own glyphs; a clamped block is taller than at a flat line-height.

---

## Components

Every entry below names its exported class (`ButtonComponent`, `TableComponent<T>`, …). Those names are exported for typing, DI, `viewChild` and template refs — **not as an extension point: subclassing a DS component is unsupported.** Any minor release may add members to a class, and a subclass that happens to have used one of those names breaks on it (TS4114 "must have an 'override' modifier", or TS2416 when the signature differs) — DS 0.6.3 added ~76 members to `TableComponent` alone. Compose instead: wrap the component, project into its slots, retune it through its `--ds-*` tokens. If you subclass anyway, treat every upgrade as potentially build-breaking — the changelog flags the risk, it does not avoid it.

**The `--ds-*` token contract, once for every component below.** Every public `--ds-<component>-*` token is READ WITH A FALLBACK and never declared by the component, so a consumer's value always wins and always inherits: set it on the host (`ds-button { --ds-button-bg-color: teal }`), on any ancestor, at `:root`, or inline. Unset tokens fall through to the component's own default, so there is nothing to opt into and nothing to reset. Two consequences worth stating: a token set at `:root` reaches EVERY instance — scope per instance or per section and keep theme-wide re-skins at role level (`--primary`, `--ds-radius-control`) — and where a component derives one value from another (a hover fill mixed from the resolved background), overriding the source retunes the derived states with it. Individual entries below therefore note only what DEVIATES from this: a derived state, a variant-specific default, a token that beats a size class.

> **Token and API lists below are hand-maintained, so treat this file as prose about intent.** The authoritative surfaces are the **Component API tables** and the **token reference** on the documentation site, both generated from the source of each release, so they cannot go stale — trust those first, and read this file for the reasoning a generated table cannot carry. Where the two disagree, the generated one is right.

### Form & input

**Shared by every field** (input, textarea, select, multi-select, autocomplete, date/time/colour picker,
checkbox, radio, radio-group, switch, slider, segmented, OTP): `label`, `hint`, `error`, `warning`,
`errors`, `invalid`, `touched`, `reserveMessage` — and one message line under the control that renders
whichever of them wins. The ladder is error → errors → warning → advisory errors → success → hint.
Every field control also has `focus(options?)` and `blur()`. `blur()` drops focus from whichever
descendant holds it and leaves a portaled panel alone; `ds-autocomplete.clear()` keeps focus on
purpose, so a host that navigates away calls `clear()` then `blur()`.

`error`, `warning` and `success` lead that line with a glyph; `hint` does not, because it is the resting
text rather than a state. Retune app-wide with `DS_CONFIG.field.stateIcons` (per state, independent —
`false` removes one, an `IconName` replaces it, `stateIcons: false` removes all four), or per field with
`messageIcon: IconName | false | null`, which wins over the config. Spacing hooks:
`--ds-field-message-icon-gap`, `--ds-field-message-icon-offset`.

**`ds-search` is deliberately NOT on that list.** It binds to a form like the others — `[formControl]`,
`formControlName`, `[(ngModel)]`, signal forms, plus its own `[(value)]` — and it takes `disabled` and
`hidden`, but it renders no message row and therefore takes none of the message inputs. A toolbar filter
is not a validated field; where a search needs a label or an error line, use `ds-input`.

**Shared box tokens.** `--ds-field-border-color`, `--ds-field-border-color-hover`, `--ds-field-border-color-focus`, `--ds-field-text-color`, `--ds-field-placeholder-color` and `--ds-field-font-size` sit UNDER each field's own token the way `--ds-field-height` and `--ds-field-label-*` do: `--ds-input-border`, `--ds-select-border-color-focus` or `--ds-autocomplete-text-color` still wins where set, and the family value fills in everywhere it is not. They reach input, textarea, select, multi-select, autocomplete and search. The date, time and colour pickers, the number stepper and the OTP cells keep their own `--ds-<component>-*` tokens and do not read the family.

#### `<ds-button>` — `ButtonComponent`
Inputs: **two orthogonal axes** — `color: ButtonColor = 'primary'` (`'primary' | 'secondary' | 'tertiary' | 'neutral' | 'error' | 'success' | 'warning'`) and `variant: ButtonVariant = 'solid'` (`'solid' | 'tonal' | 'outline' | 'ghost' | 'text'`). Plus `size: DsSize | null = null` (unset resolves `DS_CONFIG.control.size`, then `md`), `type: 'button' | 'submit' | 'reset' = 'button'`, `align: ButtonAlign = 'center'` (`'center' | 'between'`; `'between'` pushes the label and a trailing icon to opposite edges, and only shows once something widens the button past its contents), `disabled`, `loading`, `fullWidth`, `icon: IconName | null`, and the destination pair `routerLink: DsRouterLink = null` (a path, a command array or a `UrlTree`) / `href: string = ''`, with the modifiers `fragment` / `queryParams` / `queryParamsHandling` (routerLink-only) and `target` / `rel` (either link), plus `routerLinkActiveOptions` and `ariaCurrent`. Plus the refusal pair below: `disabledReason`, and the field message inputs `hint` / `warning` / `error` / `messageIcon` / `reserveMessage` / `ariaDescribedBy`.
Axis meaning: **variant is loudness** (solid > tonal > outline/ghost/text), **color is hue** — every pair renders, and the UX-discouraged ones dev-warn with the reason. Only solid and tonal paint a fill: outline, ghost and text are TRANSPARENT, so they adopt the surface they sit on. Disabled splits by whether the fill can carry the state: `solid` and `tonal` keep `oklch(from accent 70% 0.035 h)`, while `outline`, `ghost` and `text` — the three with no fill of their own — mix the label toward the surface, `color-mix(in srgb, <label> 40%, var(--surface-default))`, because a fixed lightness cannot serve both themes. (History: the single `variant` axis was split into color × variant in 2026-06; `danger`→`error`, `link`→`text`, the old `ghost`→`outline`.)
Output: `(pressed): MouseEvent` — only fires when not disabled and not loading
**`loading` keeps the button in the focus order.** It sets `aria-busy` and `aria-disabled`, never the native `disabled`, so a button pressed from the keyboard keeps focus while the work runs; the click is swallowed in the handler, so `(pressed)` does not fire and a `type="submit"` does not submit. For an action in flight bind `loading`, not `disabled`: a natively disabled button under focus drops it to the page.
**Three elements, decided by destination.** `routerLink` → an `<a [routerLink]>` with `routerLinkActive`; `href` → a plain `<a href>`; **neither → a `<button type="button">`** — the same rule `ds-sidenav-item` follows, and for the same reason: a control that navigates has to BE a link, or middle-click, open-in-new-tab, copy-link-address and the `link` role a screen reader announces are all gone. Styling is identical across all three (class-based on `.button`, and the anchor's UA underline is reset), so target the class, never the tag — measured at zero differences across eleven computed properties, focus ring included. `type` and `loading` are button-only and dev-warn if set on a link: an anchor has no form to submit, and a navigation cannot be in flight before it starts. A disabled link takes `aria-disabled` plus `tabindex="-1"` — an anchor has no native disabled state — and its click is swallowed, which is what stops an `href` from navigating anyway. **`controlRef`** (was `buttonRef` before 0.12.3) is typed `ElementRef<HTMLElement>` for that reason: it resolves whichever element rendered.
**Modifying a destination.** `fragment`, `queryParams` and `queryParamsHandling` go with a `routerLink` and dev-warn on any other destination; `target` and `rel` work on both link destinations and dev-warn on a plain button. Each is a pass-through to the anchor the component already renders. For the `UrlCreationOptions` with no input here — `relativeTo`, `preserveFragment` — pass a `UrlTree` built with `Router.createUrlTree` as the `routerLink`; folding a query or hash into the link STRING does not work, because `createUrlTree` treats the commands as path segments and percent-encodes `?` and `#`. Do NOT import `RouterLink` in your own component to write the extra inputs on a `<ds-button>`: the directive's selector matches the host, so that puts a SECOND `RouterLink` on the control disagreeing with the anchor's about where it goes.
**What an active link announces, and why it is not the `active` class.** An EXACT match announces `aria-current="page"`, a PREFIX match announces `true`, everything else announces nothing — ARIA's own split: `page` is the page you are on, `true` is the current section or an ancestor. The `active` CLASS keeps matching by prefix, so a section link still looks lit; `routerLinkActiveOptions` moves the class and `ariaCurrent` overrides the announcement (`null` silences it). Before this the attribute was derived from `routerLinkActive`, so a back-link claimed to be the page the reader was leaving — invisible on a button, because `.active` is painted by nothing there. **Two mechanism traps, both measured.** `RouterLinkActive.update()` removes `aria-current` from its host in a microtask whenever its own `ariaCurrentWhenActive` is unset, so an `[attr.aria-current]` binding on the same element is written and then wiped — the value has to go through `ariaCurrentWhenActive`. And a RELATIVE destination (`routerLink="."`, `['..', 'x']`) has to be resolved against the route the control sits on, exactly as `RouterLink` does: resolved from the root instead, `.` becomes `/`, which is a prefix of every page, so the control that IS the current page announces `true`.
**A link-STYLED action is still the global `.link` class on a `<button>`**, not this. Destination inputs give a navigation the button's LOOK; `.link` gives an action the link's look. `variant="text"` dev-warns in favour of `.link`.
Content slots: default (label / leading or trailing icon), plus `[dsButtonSubtext]` for a projected second line. For icon-only actions use `<ds-icon-button>`.
**Saying WHY a button is refused, and the two kinds of refusal.** A greyed control that does not say why is a dead end, and until 0.10.4 the only way to explain one was a tooltip — mouse-only. Which input to reach for is decided by whether the user can lift the refusal on this screen:
- **Standing** (no permission, no integration — nothing here will change it): `disabledReason` beside `disabled`. The reason renders as a second line INSIDE the button, and setting it flips how the button is disabled — `aria-disabled="true"` instead of the native attribute, because a natively disabled button never takes focus and its description would never be announced (measured; Chrome's a11y tree reports name `"Approve invoice"`, description `"Needs the Finance role"`, state disabled). The click is swallowed in the handler instead, so `(pressed)` still never fires. Leave `disabledReason` unset and NOTHING changes: the native attribute stays, and so does every existing layout. Length is deliberately uncapped — the text wraps and the button grows.
- **Temporary** (the form is not filled in yet): do NOT disable the button at all. Leave it live, judge validity in the submit handler, and carry the text UNDER the button with `hint` / `warning` / `error` — the same three inputs the fields take, resolved and rendered by the same `ds-field-message` row the fields use, with the same `messageIcon` and `reserveMessage` knobs and the same `DS_CONFIG.field.*` fallbacks. Those inputs live on an internal shared base class that `ButtonComponent` and every field extend, so the behaviour cannot drift apart. What it does NOT take is `errors` / `invalid` / `touched`: a button has no validation state of its own.
Layout: a message-bearing button becomes a column (host class `with-message`), and because the host shrinks to fit, a message longer than the label widens the pair — button included, exactly as a field's control spans its own message. Without a message the host keeps the `inline-flex` box every existing layout was built against.
Tokens: `--ds-button-bg-color`, `--ds-button-bg-color-hover`, `--ds-button-bg-color-active`, `--ds-button-bg-color-disabled`, `--ds-button-label-color`, `--ds-button-label-color-disabled`, `--ds-button-border-color`, `--ds-button-border-color-hover`, `--ds-button-border-color-active`, `--ds-button-border-color-disabled`, `--ds-button-border-width`, `--ds-button-radius`, `--ds-button-pressed-shadow`, `--ds-button-shadow`, `--ds-button-shadow-hover`. The focus ring is not a button token — set `--focus-ring-color`, `--focus-ring-width` or `--focus-ring-offset` on the button's own scope. The last two are the REST and hover shadow, both `none` by default — before them the only way to give a button a resting shadow was a deep selector into its inner `<button>`. `-shadow-hover` falls back to `-shadow`, so setting the resting one alone keeps the button steady under the pointer; focus and pressed keep their own hooks and still win while those states are on. `-border-color-hover` falls back to the rest border and `-border-color-active` to the hover one, so an outline button's edge stays put until one of them is set. For `variant="solid"`, `-bg-color-hover` / `-bg-color-active` / `-pressed-shadow` default to a `color-mix()` derivation of the resolved fill (88 % / 76 % + black — the theme's hover/pressed recipe), so overriding the fill alone retints the whole state set; tonal, outline, ghost and text keep explicit ramp defaults, so a full retint there means setting the state tokens too. 

<!-- inputs:ds-button -->
All inputs: `hint: string = ''`, `error: string = ''`, `warning: string = ''`, `reserveMessage: boolean | null = null`, `messageIcon: IconName | false | null = null`, `color: ButtonColor = 'primary'`, `variant: 'solid' | 'tonal' | 'ghost' | 'outline' | 'text' = 'solid'`, `align: 'center' | 'between' = 'center'`, `size: 'sm' | 'md' | 'lg' = null`, `routerLink: DsRouterLink = null`, `href: string = ''`, `fragment: string | undefined`, `queryParams: Params | null | undefined`, `queryParamsHandling: QueryParamsHandling | null | undefined`, `target: string | undefined`, `rel: string | undefined`, `routerLinkActiveOptions: { exact: boolean } | IsActiveMatchOptions`, `ariaCurrent: 'page' | 'step' | 'location' | 'date' | 'time' | 'true'`, `type: 'button' | 'submit' | 'reset' = 'button'`, `disabled: boolean = false`, `loading: boolean = false`, `fullWidth: boolean = false`, `ariaLabel: string | null = null`, `icon: IconName | null = null`, `trailingIcon: IconName | null = null`, `ariaHasPopup: 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' = null`, `ariaExpanded: boolean | null = null`, `ariaControls: string | null = null`, `disabledReason: string = ''`, `ariaDescribedBy: string | null = null`
<!-- /inputs -->

#### `<ds-icon-button>` — `IconButtonComponent`
Icon-only action with its own taxonomy, distinct from `ds-button`. `ariaLabel` is required (icon-only must be labelled for a11y).
Inputs: `icon: required IconName`, `ariaLabel: required string`, `ariaDescribedBy: string | null = null` (point at text the page already shows — e.g. why the action is refused; icon-only leaves no room for a second line, which is why there is deliberately no `disabledReason` here), `variant: IconButtonVariant = 'standard'` (`'standard' | 'filled' | 'tonal' | 'outlined'`), `size: IconButtonSize = 'md'` (`'sm' | 'md' | 'lg'` = 32/40/48), `type: 'button' | 'submit' | 'reset' = 'button'`, `disabled: boolean = false`, `selected: boolean = false` (toggle — sets `aria-pressed`)
Output: `(pressed): MouseEvent` — fires when not disabled
Variant emphasis: `standard` chromeless (hover-reveal) · `filled` `--primary` · `tonal` `--primary-muted` · `outlined` bordered. `selected` renders the pressed/active fill.
Tokens: `--ds-icon-button-bg-color`, `--ds-icon-button-icon-color`, `--ds-icon-button-border`, `--ds-icon-button-border-hover`, `--ds-icon-button-border-active`, `--ds-icon-button-bg-color-hover`, `--ds-icon-button-bg-color-active`, `--ds-icon-button-icon-color-hover`, `--ds-icon-button-radius`. The focus ring is not an icon-button token — set `--focus-ring-color`, `--focus-ring-width` or `--focus-ring-offset` on its own scope. `filled`/`selected` derive hover/active from the resolved bg, `standard`/`tonal`/`outlined` keep explicit ramp defaults. `-border-hover` falls back to `-border` and `-border-active` to `-border-hover`, so the border stays put until one of them is set.

<!-- inputs:ds-icon-button -->
All inputs: `icon: required IconName`, `ariaLabel: required string`, `ariaDescribedBy: string | null = null`, `variant: 'standard' | 'filled' | 'tonal' | 'outlined' = 'standard'`, `color: ButtonColor = 'primary'`, `size: 'sm' | 'md' | 'lg' = null`, `type: 'button' | 'submit' | 'reset' = 'button'`, `disabled: boolean = false`, `selected: boolean | null = null`, `ariaExpanded: boolean | null = null`, `ariaControls: string | null = null`
<!-- /inputs -->

#### `<ds-input>` — `InputComponent`
Inputs: `value: model<string>`, `type: InputType = 'text'` (`'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'`), `size: 'sm' | 'md' | 'lg' = 'md'`, `label: string = ''`, `hint: string = ''`, `placeholder: string = ''`, `disabled: boolean = false`, `invalid: boolean = false`, `required: boolean = false`, `optional: boolean = false`, `name: string | null = null`, `clearable: boolean | null = null` (inline clear (×) button; `null` resolves to `true` for `type="search"` and `false` otherwise)
Content slots — addon attributes apply to any child element:
- `[dsInputPrefix]` — leading content (icon, label, etc.)
- `[dsInputSuffix]` — trailing content (icon button, label, etc.)
- `class="addon"` — heavyweight slot pill with its own background + divider (use for textual `https://` style prefixes; for icons, prefer plain `dsInputPrefix`)

Example:
```html
<ds-input label="Email" type="email" [(value)]="email">
  <ds-icon dsInputPrefix name="mail" [size]="16"/>
  <button dsInputSuffix type="button" (click)="reveal()">
    <ds-icon name="eye-off" [size]="16"/>
  </button>
</ds-input>
```

Tokens: `--ds-input-bg-color`, `--ds-input-border`, `--ds-input-border-hover`, `--ds-input-border-focus`, `--ds-input-text-color`, `--ds-input-placeholder`, `--ds-input-radius`, `--ds-input-padding-x`, `--ds-input-padding-y`, `--ds-input-focus-shadow`, `--ds-input-border-error`, `--ds-input-bg-color-error`, `--ds-input-border-success`, `--ds-input-bg-color-disabled`, `--ds-input-font-size` (also read by `ds-textarea`)

<!-- inputs:ds-input -->
All inputs: `hint: string = ''`, `error: string = ''`, `warning: string = ''`, `reserveMessage: boolean | null = null`, `messageIcon: IconName | false | null = null`, `errors: readonly DsFieldError[] = []`, `invalid: boolean = false`, `touched: boolean = false`, `pending: boolean = false`, `dirty: boolean = false`, `showDirty: boolean | null = null`, `hidden: boolean = false`, `value: string = ''`, `type: InputType = 'text'`, `size: 'sm' | 'md' | 'lg' = null`, `label: string = ''`, `placeholder: string = ''`, `disabled: boolean = false`, `readOnly: boolean = false`, `readonly: boolean = false`, `success: string = ''`, `loading: boolean = false`, `required: boolean = false`, `optional: boolean = false`, `name: string | null = null`, `min: number | null = null`, `max: number | null = null`, `step: number | null = null`, `autocomplete: string | null = null`, `autofocus: boolean = false`, `ariaLabel: string | null = null`, `ariaDescribedBy: string | null = null`, `maxLength: number | null = null`, `minLength: number | null = null`, `pattern: readonly RegExp[] = []`, `enterKeyHint: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send' | null = null`, `inputMode: | 'none'
    | 'text'
    | 'decimal'
    | 'numeric'
    | 'tel'
    | 'search'
    | 'email'
    | 'url'
    | null = null`, `clearable: boolean | null = null`, `passwordToggle: boolean = false`, `passwordVisible: boolean = false`
<!-- /inputs -->

#### `<ds-textarea>` — `TextareaComponent`
Multi-line counterpart to `<ds-input>` — same wrapper/states, reuses the `--ds-input-*` token family. No prefix/suffix slots.
Inputs: `value: model<string>`, `size: 'sm' | 'md' | 'lg' = 'md'`, `label`, `hint`, `placeholder`, `disabled`, `invalid`, `required`, `optional: boolean = false`, `name`, `rows: number = 3`
Tokens: same `--ds-input-*` family as `<ds-input>`, `--ds-input-font-size` included (textarea overrides `--ds-input-padding-y` to `--space-3` for vertical breathing room).
New: `autosize: boolean = false` (grows with content; forces `resize='none'`), `minRows`/`maxRows: number | null = null`, `resize: 'none' | 'vertical' | 'horizontal' | 'both' = 'vertical'`.
Methods: `focus(options?)`, `selectionStart` / `selectionEnd` (reads), `setSelectionRange(start, end, direction?)`, `select()` - all forwarded to the native `<textarea>`, so an editor toolbar never queries the component's DOM. A value written through `value` lands a microtask later and moves the caret to the end; set a range after `value.set(...)` from a `setTimeout`.

<!-- inputs:ds-textarea -->
All inputs: `hint: string = ''`, `error: string = ''`, `warning: string = ''`, `reserveMessage: boolean | null = null`, `messageIcon: IconName | false | null = null`, `errors: readonly DsFieldError[] = []`, `invalid: boolean = false`, `touched: boolean = false`, `pending: boolean = false`, `dirty: boolean = false`, `showDirty: boolean | null = null`, `hidden: boolean = false`, `value: string = ''`, `size: 'sm' | 'md' | 'lg' = null`, `label: string = ''`, `placeholder: string = ''`, `disabled: boolean = false`, `readOnly: boolean = false`, `readonly: boolean = false`, `success: string = ''`, `required: boolean = false`, `optional: boolean = false`, `rows: number = 3`, `name: string | null = null`, `autosize: boolean = false`, `minRows: number | null = null`, `maxRows: number | null = null`, `resize: 'none' | 'vertical' | 'horizontal' | 'both' = 'vertical'`, `ariaLabel: string | null = null`, `maxLength: number | null = null`, `maxLengthMode: 'hard' | 'soft' = 'hard'`, `countTrimmed: boolean = false`, `minLength: number | null = null`, `pattern: readonly RegExp[] = []`
<!-- /inputs -->

#### `<ds-number-stepper>` — `NumberStepperComponent`
Spinbox for bounded quantities — −/+ buttons around a numeric value.
Inputs: `value: model<number> = 0`, `min: number = 0`, `max: number | null = null`, `step: number = 1`, `size: 'sm' | 'md' | 'lg' = 'md'`, `disabled: boolean = false`
Methods: `inc()`, `dec()` (clamp to min/max). Buttons disable at the bounds.
Tokens: `--ds-number-stepper-field-width` sizes the number itself and is derived from the box height by default — a value with more digits than that width holds is clipped rather than wrapped, so widen it for large quantities. Also `--ds-number-stepper-bg-color`, `--ds-number-stepper-border-color`, `--ds-number-stepper-step-bg-color-active`, `--ds-number-stepper-focus-shadow`.

<!-- inputs:ds-number-stepper -->
All inputs: `value: number = 0`, `min: number = 0`, `max: number | null = null`, `step: number = 1`, `size: 'sm' | 'md' | 'lg' = null`, `disabled: boolean = false`, `ariaLabel: string | null = null`
<!-- /inputs -->

#### `<ds-checkbox>` — `CheckboxComponent`
Inputs: `checked: model<boolean>`, `indeterminate: boolean = false`, `disabled: boolean = false`, `name: string | null = null`, `inputId: string | null = null`

<!-- inputs:ds-checkbox -->
All inputs: `hint: string = ''`, `error: string = ''`, `warning: string = ''`, `reserveMessage: boolean | null = null`, `messageIcon: IconName | false | null = null`, `errors: readonly DsFieldError[] = []`, `invalid: boolean = false`, `touched: boolean = false`, `pending: boolean = false`, `dirty: boolean = false`, `showDirty: boolean | null = null`, `hidden: boolean = false`, `checked: boolean = false`, `indeterminate: boolean = false`, `disabled: boolean = false`, `name: string | null = null`, `inputId: string | null = null`, `size: 'sm' | 'md' | 'lg' = null`, `required: boolean = false`, `label: string = ''`, `ariaLabel: string | null = null`
<!-- /inputs -->

#### `<ds-radio>` — `RadioComponent`
Inputs: `checked: model<boolean>`, `disabled: boolean = false`, `name: string = ''`, `value: string = ''`, `inputId: string | null = null`. Use in groups via shared `name`.

<!-- inputs:ds-radio -->
All inputs: `hint: string = ''`, `error: string = ''`, `warning: string = ''`, `reserveMessage: boolean | null = null`, `messageIcon: IconName | false | null = null`, `errors: readonly DsFieldError[] = []`, `invalid: boolean = false`, `touched: boolean = false`, `checked: boolean = false`, `deselectable: boolean = false`, `disabled: boolean = false`, `name: string = ''`, `value: unknown = ''`, `inputId: string | null = null`, `size: 'sm' | 'md' | 'lg' = null`, `required: boolean = false`, `label: string = ''`, `ariaLabel: string | null = null`
<!-- /inputs -->

#### `<ds-switch>` — `SwitchComponent`
Inputs: `checked: model<boolean>`, `disabled: boolean = false`, `name: string | null = null`, `variant: 'default' | 'success' | 'error' = 'default'`, `inputId: string | null = null`, `controlled: boolean = false`
Outputs: `(checkedRequested): boolean` - only when `controlled`: the value the user asked for; the switch waits for `[checked]` to change.
Controlled: `<ds-switch controlled [checked]="paused()" (checkedRequested)="askPause($event)" />` - a click cancels the native toggle instead of flipping, so a confirm dialog can run first and a cancelled one leaves the track untouched. Off by default; the switch flips on every toggle as before.

<!-- inputs:ds-switch -->
All inputs: `hint: string = ''`, `error: string = ''`, `warning: string = ''`, `reserveMessage: boolean | null = null`, `messageIcon: IconName | false | null = null`, `errors: readonly DsFieldError[] = []`, `invalid: boolean = false`, `touched: boolean = false`, `pending: boolean = false`, `dirty: boolean = false`, `showDirty: boolean | null = null`, `hidden: boolean = false`, `checked: boolean = false`, `disabled: boolean = false`, `name: string | null = null`, `variant: 'default' | 'success' | 'error' = 'default'`, `inputId: string | null = null`, `size: 'sm' | 'md' | 'lg' = null`, `required: boolean = false`, `label: string = ''`, `ariaLabel: string | null = null`, `controlled: boolean = false`
<!-- /inputs -->

#### The picker family — `<ds-select>`, `<ds-multi-select>`, `<ds-autocomplete>`
Five rules hold across all three: one meaning per member name, difference only where a reason is stated, one panel implementation (`.dropdown-panel` / `.dropdown-list`), no library-invented string without a slot to replace it, and one way to clip a line.

Shared inputs: `options` (flat items, groups, or a mix), `value: model`, `placeholder`, `size: DsSize | null = null`, `width: DsControlWidth = 'fill'` (`'fill' | 'content'`), `label`, `disabled`, `required`, `optional`, `success`, `ariaLabel`.

Shared option shape: `DsOption<T> = { label, value, disabled? }` and `DsOptionGroup<T> = { label, options, disabled? }`, with `DsOptionItem<T>` the union. Each picker re-exports it under its own name (`SelectItem`, `MultiSelectItem`, `AutocompleteItem<T>`), so one array literal fits all three.

Shared slots — content-projected directives, each a `<ng-template>`:
- `[dsOptionTemplate]` — the option row, on all three
- `[dsChipTemplate]` — a selected chip, on multi-select and autocomplete
- `[dsPickerTrigger]` — replaces the trigger, on all three
- `[dsEmptyTemplate]` — the "no matches" state, on all three
- `[dsCreateTemplate]` — the "create «…»" row, on autocomplete

Shared panel tokens — the three pickers portal their panel out of the component, so these are declared on the host and forwarded onto the pane; a per-instance `ds-select { --ds-dropdown-panel-radius: 8px }` reaches it. `--ds-dropdown-panel-bg-color`, `-radius`, `-maxh`, `-minw`, `-maxw` (the last two bound the panel in `width="content"`). Each picker's own `--ds-<name>-panel-bg-color` / `-radius` / `-maxh` is an ALIAS of the shared one and still works.

Shared option tokens, painting the row inside any of the three panels: `--ds-option-selected-bg-color`, `-hover`, `--ds-option-selected-label-color`, `--ds-option-check-color`. `ds-select` and `ds-autocomplete` mark the selection with the check glyph these paint; `ds-multi-select` uses a checkbox and answers to `--ds-multi-select-check-bg-color` instead.

<!-- inputs:ds-select -->
All inputs: `hint: string = ''`, `error: string = ''`, `warning: string = ''`, `reserveMessage: boolean | null = null`, `messageIcon: IconName | false | null = null`, `errors: readonly DsFieldError[] = []`, `invalid: boolean = false`, `touched: boolean = false`, `pending: boolean = false`, `dirty: boolean = false`, `showDirty: boolean | null = null`, `hidden: boolean = false`, `value: string = ''`, `options: readonly SelectItem[] = []`, `width: 'fill' | 'content' = 'fill'`, `placeholder: string = ''`, `size: 'sm' | 'md' | 'lg' = null`, `label: string = ''`, `disabled: boolean = false`, `loading: boolean = false`, `scrollActiveIntoView: boolean = true`, `panelClass: string | readonly string[] = []`, `readOnly: boolean = false`, `readonly: boolean = false`, `success: string = ''`, `required: boolean = false`, `optional: boolean = false`, `name: string | null = null`, `ariaLabel: string | null = null`, `clearable: boolean = false`, `staticPreview: boolean = false`
<!-- /inputs -->

#### `<ds-select>` — `SelectComponent`
Inputs: `value: model<string>`, `options: SelectItem[]`, `placeholder: string = ''`, `size`, `width`, `label`, `disabled`, `readOnly`, `readonly` (an alias of `readOnly`, because signal forms binds by name), `success`, `required`, `optional`, `clearable`, `name: string | null = null`, `ariaLabel`
Trigger plus a CDK overlay panel. Keyboard: ArrowUp/Down, Enter/Space, Home/End, Escape, skipping group headers. `isSelectOptionGroup(item)` is re-exported as a type guard.

<!-- inputs:ds-select -->
All inputs: `hint: string = ''`, `error: string = ''`, `warning: string = ''`, `reserveMessage: boolean | null = null`, `messageIcon: IconName | false | null = null`, `errors: readonly DsFieldError[] = []`, `invalid: boolean = false`, `touched: boolean = false`, `pending: boolean = false`, `dirty: boolean = false`, `showDirty: boolean | null = null`, `hidden: boolean = false`, `value: string = ''`, `options: readonly SelectItem[] = []`, `width: 'fill' | 'content' = 'fill'`, `placeholder: string = ''`, `size: 'sm' | 'md' | 'lg' = null`, `label: string = ''`, `disabled: boolean = false`, `loading: boolean = false`, `scrollActiveIntoView: boolean = true`, `panelClass: string | readonly string[] = []`, `readOnly: boolean = false`, `readonly: boolean = false`, `success: string = ''`, `required: boolean = false`, `optional: boolean = false`, `name: string | null = null`, `ariaLabel: string | null = null`, `clearable: boolean = false`, `staticPreview: boolean = false`
<!-- /inputs -->

#### `<ds-multi-select>` — `MultiSelectComponent`
Inputs: `value: model<string[]>`, `options: readonly MultiSelectItem[]`, `placeholder: string | null = null` (unset: `DS_INTL.picker.placeholder`), `searchPlaceholder: string | null = null` (unset: `DS_INTL.picker.filterPlaceholder`), `searchable: boolean | number | null = null` (`true` always shows the filter row, `false` never, a NUMBER shows it once the option count reaches it), `selectAll: boolean | 'group' | 'both' = false` (`'group'` puts a row per group, `'both'` adds a global row beside them), `triggerDisplay: DsTriggerDisplay = 'full'` (`'full' | 'count' | 'labels'`), `maxVisibleChips: number | 'fit' | 'all' | null = null` (a NUMBER is a ceiling, not an exact count — fewer fit when the trigger is narrow), `width`, `size`, `label`, `disabled`, `success`, `required`, `optional`, `ariaLabel`

<!-- inputs:ds-multi-select -->
All inputs: `hint: string = ''`, `error: string = ''`, `warning: string = ''`, `reserveMessage: boolean | null = null`, `messageIcon: IconName | false | null = null`, `errors: readonly DsFieldError[] = []`, `invalid: boolean = false`, `touched: boolean = false`, `pending: boolean = false`, `dirty: boolean = false`, `showDirty: boolean | null = null`, `hidden: boolean = false`, `value: string[] = []`, `options: readonly MultiSelectItem[] = []`, `placeholder: string | null = null`, `searchPlaceholder: string | null = null`, `searchable: boolean | number | null = null`, `name: string | null = null`, `panelClass: string | readonly string[] = []`, `readOnly: boolean = false`, `readonly: boolean = false`, `clearable: boolean = false`, `filterWith: ((option: MultiSelectOption, query: string) => boolean) | 'none'`, `loading: boolean = false`, `scrollActiveIntoView: boolean = true`, `maxVisibleChips: number | 'fit' | 'all' | null = null`, `disabled: boolean = false`, `success: string = ''`, `ariaLabel: string | null = null`, `width: 'fill' | 'content' = 'fill'`, `size: 'sm' | 'md' | 'lg' = null`, `triggerDisplay: 'full' | 'count' | 'labels' = 'full'`, `label: string = ''`, `required: boolean = false`, `optional: boolean = false`, `selectAll: boolean | 'group' | 'both' = false`
<!-- /inputs -->

#### `<ds-autocomplete>` — `AutocompleteComponent<T>`
Type-ahead picker, generic on the option value.
Inputs: `options: readonly AutocompleteItem<T>[]`, `value: model<T | readonly T[] | null>`, `multiple: boolean = false`, `placeholder: string | null = null` (unset: `DS_INTL.picker.placeholder`), `showChevron: boolean = true`, `valueOverflow: AutocompleteValueOverflow = 'ellipsis'` (`'ellipsis' | 'wrap'` — a settled single value clips rather than growing the trigger), `maxVisibleChips`, `allowCreate: boolean = false`, `width`, `size`, `label`, `disabled`, `success`, `required`, `optional`, `ariaLabel`
Output: `(create): string` — the typed text, when `allowCreate` is on and nothing matched.
In multiple mode the selection renders as chips above the trigger.

<!-- inputs:ds-autocomplete -->
All inputs: `hint: string = ''`, `error: string = ''`, `warning: string = ''`, `reserveMessage: boolean | null = null`, `messageIcon: IconName | false | null = null`, `errors: readonly DsFieldError[] = []`, `invalid: boolean = false`, `touched: boolean = false`, `pending: boolean = false`, `dirty: boolean = false`, `showDirty: boolean | null = null`, `hidden: boolean = false`, `options: readonly AutocompleteItem<T>[] = []`, `value: T | readonly T[] | null = null`, `multiple: boolean = false`, `showChevron: boolean = true`, `maxVisibleChips: number | 'fit' | 'all' | null = null`, `size: 'sm' | 'md' | 'lg' = null`, `width: 'fill' | 'content' = 'fill'`, `valueOverflow: 'ellipsis' | 'wrap' = 'ellipsis'`, `placeholder: string | null = null`, `disabled: boolean = false`, `success: string = ''`, `allowCreate: boolean = false`, `label: string = ''`, `compareWith: (a: T | null, b: T | null) => boolean`, `name: string | null = null`, `panelClass: string | readonly string[] = []`, `readOnly: boolean = false`, `readonly: boolean = false`, `clearable: boolean = false`, `searchPlaceholder: string = ''`, `filterWith: ((option: AutocompleteOption<T>, query: string) => boolean) | 'none'`, `loading: boolean = false`, `scrollActiveIntoView: boolean = true`, `required: boolean = false`, `optional: boolean = false`, `ariaLabel: string | null = null`
<!-- /inputs -->

#### `<ds-search>` — `SearchComponent`
Pre-styled search input with built-in icon. A form control, but not a field: no label, no message row.
Inputs: `value: model<string>`, `placeholder: string | null = null` (unset: `DS_INTL.search.placeholder`), `shortcut: string = ''` (rendered as a hint pill, e.g. `⌘K`), `showIcon: boolean = true`, `clearable: boolean = false`, `ariaLabel: string = ''`, `disabled: boolean = false`, `hidden: boolean = false`, `size: DsSize | null = null`, `debounce: number = 0` (ms held before `value` updates; clearing, Enter and `clear()` all skip the timer)
Output: `(submitted): string` — emits the current value on Enter / form submit
Methods: `clear()` — empties the field, drops an armed keystroke and publishes `''` at once, which writing `''` into `value` does not; `focus()`, `blur()`.
Binds through `NG_VALUE_ACCESSOR`, taking the value plumbing without the field-message layer — so `hint` / `error` / `warning` / `errors` / `invalid` / `touched` / `reserveMessage` / `messageIcon` are NOT inputs here.

<!-- inputs:ds-search -->
All inputs: `hidden: boolean = false`, `value: string = ''`, `placeholder: string | null = null`, `shortcut: string = ''`, `showIcon: boolean = true`, `clearable: boolean = false`, `ariaLabel: string = ''`, `disabled: boolean = false`, `size: 'sm' | 'md' | 'lg' = null`, `debounce: number = 0`
<!-- /inputs -->

#### `<ds-date-picker>` — `DatePickerComponent`
Inputs: `mode: 'single' | 'range' = 'single'`, `size: 'sm' | 'md' | 'lg' = 'md'`, `value: model<Date | DateRangeValue | null>` (`DateRangeValue = [Date | null, Date | null]`), `placeholder: string | null = null` (unset: `DS_INTL.datePicker.placeholder`), `label: string = ''`, `hint: string = ''`, `required: boolean = false`, `optional: boolean = false`
Trigger button opens a CDK overlay calendar; selecting a day in `'single'` closes the panel, in `'range'` it closes after the second pick.
Width: the field is as wide as its date format (the mask in the monospace value font), so a grid or flex track does not stretch it; `fullWidth` fills the container. `--ds-date-picker-max-width` (default `100%`) caps a `fullWidth` field, so it stops at that width in a wide dialog or column; the field never gets narrower than its date format. `size` sets the height only.

<!-- inputs:ds-date-picker -->
All inputs: `hint: string = ''`, `error: string = ''`, `warning: string = ''`, `reserveMessage: boolean | null = null`, `messageIcon: IconName | false | null = null`, `errors: readonly DsFieldError[] = []`, `invalid: boolean = false`, `touched: boolean = false`, `pending: boolean = false`, `dirty: boolean = false`, `showDirty: boolean | null = null`, `hidden: boolean = false`, `mode: 'single' | 'range' = 'single'`, `size: 'sm' | 'md' | 'lg' = null`, `fullWidth: boolean = false`, `value: Date | DateRangeValue | null = null`, `placeholder: string | null = null`, `label: string = ''`, `required: boolean = false`, `optional: boolean = false`, `panelClass: string | readonly string[] = []`, `disabled: boolean = false`, `success: string = ''`, `ariaLabel: string | null = null`, `minYear: number`, `maxYear: number`, `minDate: Date | null = null`, `maxDate: Date | null = null`, `disabledDate: ((date: Date) => boolean) | null = null`, `presets: readonly DatePickerPreset[] = []`, `locale: string | null = null`, `dateFormat: string | null = null`, `firstDayOfWeek: number | null = null`, `defaultDate: Date | null = null`, `allowInput: boolean = true`, `staticPreview: boolean = false`
<!-- /inputs -->

#### `<ds-dropzone>` — `DropzoneComponent`
File upload area.
Inputs: `accept: string = ''`, `multiple: boolean = false`, `files: model<DropzoneFile[]>` (`{ id, name, size, state: 'uploading' | 'success' | 'error', progress }`)
Outputs: `(filesAdded): File[]` (raw browser File list from drop or picker), `(fileRemoved): DropzoneFile` (a chip's remove button)

<!-- inputs:ds-dropzone -->
All inputs: `accept: string = ''`, `multiple: boolean = false`, `files: DropzoneFile[] = []`, `disabled: boolean = false`
<!-- /inputs -->

---

#### `<ds-button-group>` — `ButtonGroupComponent`

<!-- inputs:ds-button-group -->
All inputs: `ariaLabel: string | null = null`
<!-- /inputs -->

#### `<ds-split-button>` — `SplitButtonComponent`

<!-- inputs:ds-split-button -->
All inputs: `label: string = ''`, `variant: 'primary' | 'outline' = 'primary'`, `icon: IconName | null = null`, `disabled: boolean = false`, `menuItems: readonly SplitButtonItem[] = []`, `menuLabel: string | null = null`
<!-- /inputs -->

#### `<ds-toggle-button>` — `ToggleButtonComponent`

<!-- inputs:ds-toggle-button -->
All inputs: `pressed: boolean = false`, `icon: string = ''`, `disabled: boolean = false`
<!-- /inputs -->

#### `<ds-color-picker>` — `ColorPickerComponent`

<!-- inputs:ds-color-picker -->
All inputs: `hint: string = ''`, `error: string = ''`, `warning: string = ''`, `reserveMessage: boolean | null = null`, `messageIcon: IconName | false | null = null`, `errors: readonly DsFieldError[] = []`, `invalid: boolean = false`, `touched: boolean = false`, `pending: boolean = false`, `dirty: boolean = false`, `showDirty: boolean | null = null`, `hidden: boolean = false`, `value: string = '#2F54FF'`, `presets: readonly string[]`, `panelClass: string | readonly string[] = []`, `disabled: boolean = false`, `ariaLabel: string | null = null`, `success: string = ''`, `staticPreview: boolean = false`
<!-- /inputs -->

#### `<ds-field-group>` — `FieldGroupComponent`

<!-- inputs:ds-field-group -->
All inputs: `hint: string = ''`, `error: string = ''`, `warning: string = ''`, `reserveMessage: boolean | null = null`, `messageIcon: IconName | false | null = null`, `size: 'sm' | 'md' | 'lg' = null`, `invalid: boolean = false`, `disabled: boolean = false`, `fullWidth: boolean = false`
<!-- /inputs -->

#### `<ds-otp-input>` — `OtpInputComponent`

<!-- inputs:ds-otp-input -->
All inputs: `hint: string = ''`, `error: string = ''`, `warning: string = ''`, `reserveMessage: boolean | null = null`, `messageIcon: IconName | false | null = null`, `errors: readonly DsFieldError[] = []`, `invalid: boolean = false`, `touched: boolean = false`, `pending: boolean = false`, `dirty: boolean = false`, `showDirty: boolean | null = null`, `hidden: boolean = false`, `value: string = ''`, `length: number = 6`, `mode: 'numeric' | 'alphanumeric' = 'numeric'`, `mask: boolean = false`, `disabled: boolean = false`, `success: string = ''`, `ariaLabel: string | null = null`
<!-- /inputs -->

#### `<ds-password-rules>` — `PasswordRulesComponent`

<!-- inputs:ds-password-rules -->
All inputs: `value: string = ''`, `rules: readonly DsPasswordRule[] = []`, `showUnmet: boolean = false`, `columns: 1 | 2 = 1`, `listId: string`
<!-- /inputs -->

#### `<ds-radio-group>` — `RadioGroupComponent`

<!-- inputs:ds-radio-group -->
All inputs: `hint: string = ''`, `error: string = ''`, `warning: string = ''`, `reserveMessage: boolean | null = null`, `messageIcon: IconName | false | null = null`, `errors: readonly DsFieldError[] = []`, `invalid: boolean = false`, `touched: boolean = false`, `pending: boolean = false`, `dirty: boolean = false`, `showDirty: boolean | null = null`, `hidden: boolean = false`, `value: unknown = null`, `name: string | null = null`, `disabled: boolean = false`, `ariaLabel: string | null = null`, `label: string = ''`
<!-- /inputs -->

#### `<ds-segmented>` — `SegmentedComponent`

<!-- inputs:ds-segmented -->
All inputs: `hint: string = ''`, `error: string = ''`, `warning: string = ''`, `reserveMessage: boolean | null = null`, `messageIcon: IconName | false | null = null`, `errors: readonly DsFieldError[] = []`, `invalid: boolean = false`, `touched: boolean = false`, `pending: boolean = false`, `dirty: boolean = false`, `showDirty: boolean | null = null`, `hidden: boolean = false`, `options: readonly SegmentedOption[] = []`, `value: string = ''`, `ariaLabel: string | null = null`, `label: string = ''`, `disabled: boolean = false`, `joined: boolean = false`
<!-- /inputs -->

#### `<ds-slider>` — `SliderComponent`

<!-- inputs:ds-slider -->
All inputs: `hint: string = ''`, `error: string = ''`, `warning: string = ''`, `reserveMessage: boolean | null = null`, `messageIcon: IconName | false | null = null`, `errors: readonly DsFieldError[] = []`, `invalid: boolean = false`, `touched: boolean = false`, `pending: boolean = false`, `dirty: boolean = false`, `showDirty: boolean | null = null`, `hidden: boolean = false`, `value: SliderValue = 0`, `min: number = 0`, `max: number = 100`, `step: number = 1`, `range: boolean = false`, `disabled: boolean = false`, `ariaLabel: string | null = null`
<!-- /inputs -->

#### `<ds-time-picker>` — `TimePickerComponent`

<!-- inputs:ds-time-picker -->
All inputs: `hint: string = ''`, `error: string = ''`, `warning: string = ''`, `reserveMessage: boolean | null = null`, `messageIcon: IconName | false | null = null`, `errors: readonly DsFieldError[] = []`, `invalid: boolean = false`, `touched: boolean = false`, `pending: boolean = false`, `dirty: boolean = false`, `showDirty: boolean | null = null`, `hidden: boolean = false`, `value: string | TimeRangeValue | null = null`, `mode: 'single' | 'range' = 'single'`, `minuteStep: number = 1`, `minTime: string | null = null`, `maxTime: string | null = null`, `disabledTime: ((time: string) => boolean) | null = null`, `size: 'sm' | 'md' | 'lg' = null`, `fullWidth: boolean = false`, `label: string = ''`, `required: boolean = false`, `optional: boolean = false`, `panelClass: string | readonly string[] = []`, `disabled: boolean = false`, `success: string = ''`, `placeholder: string = '--:--'`, `clearable: boolean = false`, `ariaLabel: string | null = null`, `format: '24h' | '12h' = null`, `staticPreview: boolean = false`
<!-- /inputs -->

#### `<ds-filter-bar>` — `FilterBarComponent`

<!-- inputs:ds-filter-bar -->
All inputs: `moreLabel: string | null = null`, `panelLabel: string | null = null`, `triggerSize: 'sm' | 'md' | 'lg' = 'md'`
<!-- /inputs -->

#### `<ng-template[dsFilterItem]>` — `FilterItemDirective`

<!-- inputs:ng-template[dsFilterItem] -->
All inputs: `dsFilterItem: unknown`
<!-- /inputs -->

### Display & feedback

#### `<ds-badge>` — `BadgeComponent`
Inputs: `status: DsStatusKey` (consumer-registered status key; colours wired via `styles/status`, unset → neutral), `withDot: boolean = false`, `solid: boolean = false`, `count: number | null = null`, `max: number = 99`
Content: label text. Use for status pills, counts, lifecycle markers.

<!-- inputs:ds-badge -->
All inputs: `status: DsStatusKey`, `withDot: boolean | null = null`, `solid: boolean = false`, `count: number | null = null`, `max: number = 99`, `countLabel: string | null = null`
<!-- /inputs -->

#### `<ds-status-dot>` — `StatusDotComponent`
Input: `status: DsStatusKey` (same consumer-registered vocabulary as `ds-badge`; colours wired via `styles/status`, unset → neutral). Tiny coloured dot.

<!-- inputs:ds-status-dot -->
All inputs: `status: DsStatusKey`, `ariaLabel: string | null = null`
<!-- /inputs -->

#### `<ds-tag>` — `TagComponent`
Inputs: `variant: 'solid' | 'neutral' = 'solid'`, `closable: boolean = false`
Output: `(closed): void` — emits when the close button is pressed
Content: label.

<!-- inputs:ds-tag -->
All inputs: `variant: 'solid' | 'neutral' = 'solid'`, `closable: boolean = false`, `interactive: boolean = false`, `selected: boolean = false`, `closeLabel: string | null = null`
<!-- /inputs -->

#### `<ds-avatar>` — `AvatarComponent`
Inputs: `size: 'xs' | 'sm' | 'md' | 'lg' = 'md'`, `initials: string = ''`, `imageUrl: string | null = null`, `tint: { bg, fg } | 'neutral' | null = null` (off-token override; `'neutral'` swaps to the overflow-chip palette)

<!-- inputs:ds-avatar -->
All inputs: `size: 'xs' | 'sm' | 'md' | 'lg' = 'md'`, `initials: string = ''`, `name: string = ''`, `initialsRule: ((name: string) => string) | null = null`, `imageUrl: string | null = null`, `ariaLabel: string | null = null`, `tint: { bg: string; fg: string } | 'neutral' | null = null`, `status: 'online' | 'offline' | 'away' | 'busy' = null`, `fallbackIcon: IconName | null = null`, `seed: string | null = null`, `avoidHues: readonly (readonly [number, number])[] = []`
<!-- /inputs -->

#### `<ds-avatar-group>` — `AvatarGroupComponent`
Inputs: `max: number = 4` (visible avatars before "+N" overflow), `total: number | null = null` (used to compute the overflow count; without `total` no overflow chip renders).
Content: project `<ds-avatar>` children.

<!-- inputs:ds-avatar-group -->
All inputs: `max: number = 4`, `total: number | null = null`
<!-- /inputs -->

#### `<ds-bar>` — `BarComponent`
One horizontal track with one fill: a task's completion, or a measurement on a known scale. No circular variant.
Inputs: `value: number = 0` (in units of `max`, clamped), `max: number = 100`, `semantics: 'progress' | 'meter' | 'none' = 'progress'`, `variant: 'default' | 'success' | 'warning' | 'error' = 'default'`, `indeterminate: boolean = false`, `color: string | null = null`, `target: number | null = null`, `ariaLabel: string | null = null`.
`semantics` is the claim the bar makes, and it decides the role: `'progress'` is how far a task has got (`role="progressbar"`), `'meter'` is a measurement on a known scale with no beginning and no completion — a rate, a score, a count against a ceiling (`role="meter"`), `'none'` draws it and hides it from assistive technology. Use `'none'` for a bar in a table cell whose figure is printed beside it: left at the default, a table of two hundred rows announces two hundred progress bars.
`max` is the scale `value` and `target` are read against; left at 100 they are percentages. Set it to the real total — `[value]="37" [max]="80"` — and `aria-valuenow`/`aria-valuemax` carry "37 of 80" instead of a percentage the caller had to compute. For a column of measurements it is usually the column's own largest value. Zero or less falls back to 100.
`target` is a second point on the same scale, drawn as a hairline across the track — a goal, a baseline or a threshold. Clamped like `value` and ignored while `indeterminate`. The role announces one value, so name the comparison in `ariaLabel` ("Resolved 62% against a 75% target").
`indeterminate` is ignored unless `semantics` is `'progress'`: only a task has an unknown duration.
The bar fills its box, so the column decides its width. A box sized to its content is sized by what its contents contribute intrinsically and a `100%`-wide child contributes nothing, so the host carries a `min-inline-size` of `3rem`.
Tokens: `--ds-bar-height`, `--ds-bar-min-width`, `--ds-bar-track-color`, `--ds-bar-fill-color`, `--ds-bar-fill-color-success`, `--ds-bar-fill-color-warning`, `--ds-bar-fill-color-error`, `--ds-bar-target-color`, `--ds-bar-target-width`.

<!-- inputs:ds-bar -->
All inputs: `value: number = 0`, `max: number = 100`, `semantics: 'progress' | 'meter' | 'none' = 'progress'`, `variant: 'default' | 'success' | 'warning' | 'error' = 'default'`, `indeterminate: boolean = false`, `color: string | null = null`, `ariaLabel: string | null = null`, `target: number | null = null`
<!-- /inputs -->

#### `<ds-spinner>` — `SpinnerComponent`
Input: `size: 'sm' | 'md' | 'lg' = 'md'`. Pure-CSS spinner, `role="status"` with built-in `aria-label`.

<!-- inputs:ds-spinner -->
All inputs: `size: 'sm' | 'md' | 'lg' = 'md'`
<!-- /inputs -->

#### `<ds-skeleton>` — `SkeletonComponent`
Inputs: `width?: string`, `height?: string`, `circle: boolean = false`, `inline: boolean = false`, `shimmer: boolean = true` (`false` draws a still block of the same shape, for a space held for something that is not loading yet). The wave advances in `--ds-skeleton-wave-steps` steps per pass (default `68`: twenty a second over the default `--ds-skeleton-wave-duration`); more is smoother and costs a main-thread update each.

<!-- inputs:ds-skeleton -->
All inputs: `width: string | undefined`, `height: string | undefined`, `circle: boolean = false`, `inline: boolean = false`, `shimmer: boolean = true`
<!-- /inputs -->

#### `<ds-stat>` — `StatComponent`
Inputs: `label: required string`, `value: required string | number`, `delta: number | null = null`, `deltaLabel: string = ''`, `caption: string = ''`, `unit: string = ''`, `variant: 'default' | 'danger' = 'default'`
Delta direction is derived from the sign of `delta`: positive → up (arrow + green), negative → down (arrow + red), zero/null → neutral.

<!-- inputs:ds-stat -->
All inputs: `label: required string`, `value: string | number | null = ''`, `delta: number | null = null`, `deltaLabel: string = ''`, `deltaTone: 'neutral' | 'secondary' = null`, `caption: string = ''`, `unit: string = ''`, `variant: 'default' | 'error' = 'default'`, `size: 'sm' | 'md' | 'lg' = 'md'`
<!-- /inputs -->

#### `<ds-empty-state>` — `EmptyStateComponent`
Inputs: `variant: 'none' | 'loading' | 'error' | 'locked' = 'none'`, `icon: IconName | null = null` (defaults derive from variant — `warn` for error, `lock` for locked, `package` otherwise), `title: string = ''`, `body: string = ''`
Content slot: `[actions]` — CTA buttons / links.

<!-- inputs:ds-empty-state -->
All inputs: `variant: 'none' | 'loading' | 'error' | 'locked' | 'success' = 'none'`, `icon: IconName | null = null`, `title: string = ''`, `body: string = ''`
<!-- /inputs -->

#### `<ds-banner>` — `BannerComponent`
Inputs: `variant: 'info' | 'success' | 'warning' | 'severe' | 'error' | 'neutral' = 'info'`, `title: string = ''`, `dismissible: boolean = false`, `icon: IconName | null = null` (variant-derived default), `compact: boolean = false`, `layout: 'stacked' | 'row' = 'stacked'`, `accentRail: boolean = true`
Output: `(closed): void`
Content slots: default (body text), `[actions]` (trailing CTAs)
- `layout="stacked"` (default): actions wrap onto a new line, indented under the body. Use for multiple-line messages or multiple CTAs.
- `layout="row"`: actions sit at the right edge, vertically centred with the body. Use for one-line messages with a single trailing CTA.
- Dismissing with focus on the close button moves focus to the next control after the banner, or the one before it when nothing follows. Focus a `(closed)` handler moves elsewhere stays there.
- `announce: boolean | null = null` resolves input → `DS_CONFIG.banner.announce` → `false`. Dev mode warns once per instance in two cases: an `error` / `warning` / `severe` banner left unbound while the key is unset (ends when the key is set, `true` or `false`), and an `info` / `success` / `neutral` banner that announces only because the key is `true` (ends at an `[announce]` binding). Neither message reaches a production build.

<!-- inputs:ds-banner -->
All inputs: `variant: BannerVariant = 'info'`, `title: string = ''`, `dismissible: boolean = false`, `icon: IconName | null = null`, `compact: boolean = false`, `layout: 'stacked' | 'row' = 'stacked'`, `accentRail: boolean = true`, `announce: boolean | null = null`
<!-- /inputs -->

#### `<ds-alert>` — `AlertComponent`
Inline message, `ds-banner`'s smaller twin — same anatomy, sized for placement inside a form or a card rather than across a page.
Inputs: `variant: 'info' | 'success' | 'warning' | 'error' | 'neutral' = 'info'`, `title: string = ''`, `dismissible: boolean = false`, `icon: IconName | null = null` (variant-derived default)
Output: `(closed): void`
Content slots: default (body text), `[actions]` (trailing CTAs)
- `announce` follows `DS_CONFIG.alert.announce` with the same two dev warnings as `ds-banner`, prefixed `[ds-alert]`.
- Dismissing moves focus as `ds-banner` does: to the next control after the alert, else the one before it.

<!-- inputs:ds-alert -->
All inputs: `variant: 'info' | 'success' | 'warning' | 'error' | 'neutral' = 'info'`, `title: string = ''`, `dismissible: boolean = false`, `icon: IconName | null = null`, `announce: boolean | null = null`
<!-- /inputs -->

#### `<ds-toast>` — `ToastComponent`
Inputs: `variant: 'info' | 'success' | 'warning' | 'error' | 'loading' = 'info'`, `title: string = ''`, `message: string = ''`, `dismissible: boolean = false`, `icon: IconName | null = null` (variant-derived default), `action: ToastAction | null = null` (`{ label, handler }` — renders a trailing button)
Output: `(closed): void`
Content slots: default (body text, an alternative to `message`), `[actions]` (trailing CTAs). Neither is reachable through `ToastService`, which renders from `ToastOptions` — they are for a `<ds-toast>` you place yourself.

The companion `<ds-toast-region>` lives inside the `ToastService` (see Services) — it is auto-mounted via a CDK overlay on first `toast.show()`, so consumers do **not** need to place `<ds-toast-region>` anywhere in their markup. Render `<ds-toast>` directly only for static specimens.

A toast leaving with focus inside it (its action, its close button, or `ToastRef.dismiss()`) hands focus to the next toast in the region, else back to the element focused before focus entered the region, as a dialog returns it.

<!-- inputs:ds-toast -->
All inputs: `variant: 'info' | 'success' | 'warning' | 'error' | 'loading' = 'info'`, `title: string = ''`, `body: string = ''`, `dismissible: boolean = false`, `icon: IconName | null = null`, `action: ToastAction | null = null`
<!-- /inputs -->

---

#### `<ds-list>` — `ListComponent`

<!-- inputs:ds-list -->
All inputs: `dividers: boolean = true`
<!-- /inputs -->

#### `<ds-list-item>` — `ListItemComponent`

<!-- inputs:ds-list-item -->
All inputs: `title: string = ''`, `subtitle: string = ''`, `clickable: boolean = false`, `selected: boolean = false`, `disabled: boolean = false`
<!-- /inputs -->

#### `<ds-loading-overlay>` — `LoadingOverlayComponent`

Tokens: `--ds-loading-overlay-radius` (default `0`) rounds the scrim's corners; set it to the radius of the container the overlay covers, or the blurred scrim ends in square corners.

<!-- inputs:ds-loading-overlay -->
All inputs: `loading: boolean = false`, `label: string = ''`, `blur: boolean = true`, `spinnerSize: 'sm' | 'md' | 'lg' = 'md'`, `insetTop: string = '0'`, `inertContent: boolean = true`
<!-- /inputs -->

#### `<ds-timeline-item>` — `TimelineItemComponent`

<!-- inputs:ds-timeline-item -->
All inputs: `heading: string = ''`, `time: string = ''`, `icon: IconName | null = null`, `tone: TimelineTone = 'default'`
<!-- /inputs -->

#### `<ds-toast-region>` — `ToastRegionComponent`

<!-- inputs:ds-toast-region -->
All inputs: `maxVisible: number`, `showQueueCount: boolean = true`
<!-- /inputs -->

#### `<ds-tree>` — `TreeComponent`

<!-- inputs:ds-tree -->
All inputs: `nodes: readonly TreeNode[] = []`, `expandedIds: Set<string>`, `selectedId: string | null = null`
<!-- /inputs -->

#### `<ds-description-list>` — `DescriptionListComponent`
**A horizontal list stacks when a value would get too narrow.** Each item is a wrapping flex row: once the list is narrower than label width + column gap + `--ds-description-list-value-min-width` (14rem), every item puts its label above its value at once, and the switch follows `--ds-description-list-label-width` by itself. A standalone `ds-description-item` switches the same way at its own width. In a parent that sizes to its content (inline-block, float, absolute position, a flex row item with an auto basis, an `auto` grid track) a list whose widest value is under the minimum stacks; give it a width there. `orientation="stacked"` stacks at every width.
Tokens: `--ds-description-list-label-width`, `--ds-description-list-column-gap`, `--ds-description-list-row-gap`, `--ds-description-list-value-min-width`

<!-- inputs:ds-description-list -->
All inputs: `orientation: 'horizontal' | 'stacked' = 'horizontal'`
<!-- /inputs -->

#### `<ds-description-item>` — `DescriptionItemComponent`

<!-- inputs:ds-description-item -->
All inputs: `term: string = ''`, `copyValue: string | null = null`
<!-- /inputs -->

### Layout & navigation

#### `<ds-sidenav>` — `SidenavComponent`
Inputs: `collapsed: boolean = false`, `brand: string | null = null` (renders a letter mark + name; omit to project custom content, or set `DS_CONFIG.brand.name`), `logoLetter: string | null = null` (the mark's glyph; derived from `brand` when unset), `rail: boolean = true` (whether an active item draws its edge marker — turn it off here rather than painting `--ds-sidenav-item-rail` transparent), `brandRoute: string | readonly unknown[] | null = null`, `brandLinkLabel: string | null = null`
Content: default slot for groups/items + custom brand/footer rows
**The brand row leads home only if you say so.** `brandRoute` turns the mark + wordmark into one link; unset, the row stays a plain block. A logo that goes nowhere should not be a link, and whether a mark is a way home is an app's decision, not the DS's — so this is opt-in, like every other new capability here. The link announces itself as `"<brand>, home"` because a wordmark alone does not say where it goes; `brandLinkLabel` overrides that. Router targets only, and `RouterLink` is instantiated only inside the `@if`, so an app with no router provided still renders the sidenav. A collapse toggle projected into the row stays OUTSIDE the link — one control never nests inside another.
Tokens: `--ds-sidenav-bg-color`, `--ds-sidenav-border`, `--ds-sidenav-width`, `--ds-sidenav-width-collapsed`, `--ds-sidenav-mark-bg-color`, `--ds-sidenav-mark-label-color`

<!-- inputs:ds-sidenav -->
All inputs: `collapsed: boolean = false`, `rail: boolean = true`, `brand: string | null = null`, `logoLetter: string | null = null`, `brandRoute: string | readonly unknown[] | null = null`, `brandLinkLabel: string | null = null`
<!-- /inputs -->

#### `<ds-sidenav-group>` — `SidenavGroupComponent`
Inputs: `label: string = ''`, `icon: IconName | null = null`, `expandable: boolean = false`, `expanded: model<boolean> = true`
Content slots: default (items); `[ds-group-icon]` (custom group icon when not using a DS IconName)
When `expandable=true` renders header button with toggle + caret; collapses body when not expanded.

<!-- inputs:ds-sidenav-group -->
All inputs: `label: string = ''`, `icon: IconName | null = null`, `expandable: boolean = false`, `routerLink: DsRouterLink = null`, `ariaCurrent: 'page' | 'step' | 'location' | 'date' | 'time' | 'true'`, `expanded: boolean = true`
<!-- /inputs -->

#### `<ds-sidenav-item>` — `SidenavItemComponent`
Inputs: `icon: IconName | null = null` (optional — falls back to `[icon]` slot), `label: required string`, `href: string = ''`, `routerLink: string | readonly unknown[] | null = null`, `active: boolean = false`, `badge: number | null = null`, `hasAlert: boolean = false`, `rail: boolean | null = null` (draws the active item's edge marker; unset follows the parent `ds-sidenav`)
Content slots: `[icon]` (custom icon when not using a DS IconName), `[trailing]` (right-aligned chrome — badges, indicators, kbd shortcuts)
**What an active item announces.** An EXACT match on the item's destination announces `aria-current="page"`; a PREFIX match announces `true`, which in a sidenav is the useful case — "you are in this section". `ariaCurrent` overrides it, `null` silences it, and the `active` class is a separate question decided by `routerLinkActive`. `ds-sidenav-group` follows the same rule on a header that is itself a destination, and `routerLink` on both accepts a `UrlTree`. The value must go through `ariaCurrentWhenActive`, never `[attr.aria-current]`, and a relative destination must be resolved against the control's own route — see the two traps under `ds-button`.
**Three elements, decided by destination.** `routerLink` → an `<a [routerLink]>` with `routerLinkActive`; `href` → a plain `<a href>`; **neither → a `<button type="button">`**. Until 0.11.0 the last case fell back to `href="#"`, which navigates: it rewrites the URL and discards the scroll position on every click. An item that only emits `activate` is a button. Styling is identical across all three — the rules are class-based (`.item`) and the button's UA chrome is reset — so target the class, never the tag.
Tokens (on `:host`): `--ds-sidenav-item-label-color`, `--ds-sidenav-item-label-color-hover`, `--ds-sidenav-item-bg-color-hover`, `--ds-sidenav-item-bg-color-active` (default: `--accent-subtitle` — a wash, not a solid pill), `--ds-sidenav-item-label-color-active` (default: `--accent-strong`), `--ds-sidenav-item-bg-color-active-hover` (default: `--accent-muted`, deepening toward the accent), `--ds-sidenav-item-rail` (left rail, default: `--accent-strong`), `--ds-sidenav-item-radius`, `--ds-sidenav-alert-color`

<!-- inputs:ds-sidenav-item -->
All inputs: `icon: IconName | null = null`, `label: required string`, `href: string = ''`, `routerLink: DsRouterLink = null`, `active: boolean = false`, `ariaCurrent: 'page' | 'step' | 'location' | 'date' | 'time' | 'true'`, `badge: number | null = null`, `hasAlert: boolean = false`, `disabled: boolean = false`, `rail: boolean | null = null`
<!-- /inputs -->

#### `<ds-topbar>` — `TopBarComponent`
No inputs.
Content slots: `[title]`, `[breadcrumbs]`, `[search]`, `[actions]`. Sits at `--topbar-h` height.
Tokens (on `:host`): `--ds-topbar-height`, `--ds-topbar-bg-color`, `--ds-topbar-border`, `--ds-topbar-title-text-color`, plus the `--ds-topbar-crumb-*` set for the breadcrumb row. **The topbar owns no bottom gap** — it has no margin token and sets no margin; spacing to the next block belongs to the page or to `ds-app-layout`'s content padding.

#### `<ds-app-layout>` — `AppLayoutComponent`
Inputs: `topbarSpan: 'content' | 'full' = 'content'`, `railOpen: model<boolean> = false` (the overlay rail below `--bp-lg`), `railLabel: string | null = null` (unset: `DS_INTL.appLayout.railLabel`), `restoreScroll: boolean = false`, `restoreScrollTimeout: number = 2000` (ms), `scrollReset: 'path' | 'always' | 'never' = 'path'`
Content slots: `[sidenav]`, `[topbar]`, default (the page)
Reads: `railId` and the read-only `railOverlay` signal, for a consumer-built burger; `dsRailTrigger` wires one for you.
Tokens: `--ds-app-layout-padding-x`, `--ds-app-layout-padding-y`, `--ds-app-layout-content-max-width`, `--ds-app-layout-height`, `--ds-app-layout-rail-bg-color`, `--ds-app-layout-rail-shadow`, `--ds-app-layout-scrim-color`
It owns the app's scroll CONTAINER, so a screen that needs to move the scroll calls `AppLayoutScrollService` rather than touching `window`.

<!-- inputs:ds-app-layout -->
All inputs: `topbarSpan: 'content' | 'full' = 'content'`, `railOpen: boolean = false`, `railLabel: string | null = null`, `restoreScroll: boolean = false`, `restoreScrollTimeout: number = 2000`, `scrollReset: 'path' | 'never' | 'always' = 'path'`
<!-- /inputs -->

#### `<ds-auth-layout>` — `AuthLayoutComponent`
Inputs: `brand: string | null = null`, `logoLetter: string | null = null`, `tagline: string | null = null` (all three fall back to `DS_CONFIG.brand`), `cardElevation: CardElevation = 'raised'`, `cardPadding: CardPadding = 'lg'`, `landmark: 'main' | 'none' = 'main'`
Content slots: `[brand]` (replaces the whole mark row), `[dsBrandName]` (the name beside the generated mark), default (the card body), `[dsAuthSupport]` (the line under the card)
Tokens: `--ds-auth-layout-min-height`, `--ds-auth-layout-bg-color`, `--ds-auth-layout-gap`, `--ds-auth-layout-padding-block`, `--ds-auth-layout-card-max-width`, `--ds-auth-layout-mark-size`, `--ds-auth-layout-mark-radius`, `--ds-auth-layout-mark-bg-color`, `--ds-auth-layout-mark-label-color`, `--ds-auth-layout-mark-font-size`, `--ds-auth-layout-brand-name-font-size`, `--ds-auth-layout-brand-max-height`
`landmark="none"` when the page already has a `<main>` (inside `ds-app-layout`, for one); by default the card is the page's main landmark.

<!-- inputs:ds-auth-layout -->
All inputs: `brand: string | null = null`, `logoLetter: string | null = null`, `tagline: string | null = null`, `cardElevation: 'flat' | 'raised' | 'hover' | 'interactive' = 'raised'`, `cardPadding: 'none' | 'sm' | 'md' | 'lg' = 'lg'`, `landmark: 'main' | 'none' = 'main'`
<!-- /inputs -->

#### `<ds-page-header>` — `PageHeaderComponent`
Inputs: `eyebrow: string = ''`, `title: required string`, `subtitle: string = ''`, `compact: boolean = false`, `divider: boolean = false`, `metaDivider: boolean = false`
Content slots: `[breadcrumbs]`, `[title-badge]` (sits next to the title text), `[actions]` (right edge of title row), `[meta]` (under the title row), `[tabs]` (under the meta row)
Tokens: `--ds-page-header-eyebrow-text-color`, `--ds-page-header-title-text-color`, `--ds-page-header-subtitle-text-color`, `--ds-page-header-meta-text-color`, `--ds-page-header-meta-icon-color`, `--ds-page-header-divider`, `--ds-page-header-title-font-size` (default `--font-size-h3`; `compact` flips to `--font-size-h4`), `--ds-page-header-subtitle-font-size` (default `--font-size-s`). The page-header does NOT own its bottom gap — the parent page `:host` owns spacing via `display: flex; flex-direction: column; gap: var(--space-4)`.

<!-- inputs:ds-page-header -->
All inputs: `eyebrow: string = ''`, `title: string = ''`, `subtitle: string = ''`, `compact: boolean = false`, `divider: boolean = false`, `metaDivider: boolean = false`
<!-- /inputs -->

#### `<ds-page-footer>` — `PageFooterComponent`
Input: `variant: 'default' | 'compact' | 'save' = 'default'`
Content: default `<ng-content>`. Sticky footer bar pattern.

<!-- inputs:ds-page-footer -->
All inputs: `variant: 'default' | 'compact' | 'save' = 'default'`
<!-- /inputs -->

#### `<ds-breadcrumbs>` — `BreadcrumbsComponent`
Inputs: `items: BreadcrumbItem[] | null = null` (`{ label?, href?, icon? }` — when `null`/omitted, the component reads from `BreadcrumbsService.items` so route-driven flows work without a per-page `[items]` binding), `separator: IconName | null = null` (overrides `DsConfig.breadcrumbs.separator`, falls back to `'chevronRight'`), `clickable: boolean | null = null` (overrides `DsConfig.breadcrumbs.clickable`, falls back to `true`)
Output: `(navigate): BreadcrumbItem` — emits when an item with `href` is clicked and `clickable` resolves to `true` (a plain primary click is `preventDefault`-ed so the consumer can decide what to do; Ctrl, Cmd, Shift, Alt or a non-primary button leaves the browser to open `href`, e.g. in a new tab)

<!-- inputs:ds-breadcrumbs -->
All inputs: `items: BreadcrumbItem[] | null = null`, `separator: IconName | null = null`, `clickable: boolean | null = null`, `maxItems: number | null = null`
<!-- /inputs -->

#### `<ds-tabs>` + `<ds-tab>` — `TabsComponent`, `TabComponent`
Container holds `<ds-tab label="…">` children.
Tabs inputs: `selectedIndex: model<number> = 0`, `variant: 'line' | 'pills' = 'line'`
Tab inputs: `label: required string`, `icon: IconName | null = null`, `count: number | null = null`, `disabled: boolean = false`. The tab's projected content renders in the active panel.
`scrollable` scrolls a horizontal strip inside its own box and, while tabs lie beyond an edge, shows a previous/next arrow on that side that turns the strip by a page (hidden at its own edge; no arrows on a strip that fits). The arrows are pointer affordances outside the tab order and hidden from assistive technology, since arrow keys already bring the selected tab into view.
Tokens: `--ds-tab-label-color`, `--ds-tab-label-color-hover`, `--ds-tab-label-color-active`, `--ds-tab-indicator-color`, `--ds-tab-indicator-width`, `--ds-tab-padding-x`, `--ds-tab-padding-y`, `--ds-tabs-divider`, `--ds-tabs-pills-bg-color`, `--ds-tabs-scroll-arrow-bg-color-hover` (a `scrollable` arrow's hover fill, defaults to `var(--surface-secondary)`), `--ds-tabs-scroll-arrow-icon-color-hover` (its hover chevron, defaults to the active tab label colour), `--ds-tab-pill-bg-color-hover` (inactive hover, defaults to `var(--primary-subtle)`), `--ds-tab-pill-bg-color-active` (defaults to `var(--surface-default)` — elevated card), `--ds-tab-pill-bg-color-active-hover` (defaults to `var(--primary-subtle)`), `--ds-tab-pill-label-color-active` (defaults to `var(--primary-strong)`), `--ds-tab-pill-radius` (defaults to `var(--radius-md)` — same as buttons/inputs; override per-instance to `var(--radius-pill)` for fully round pills).

<!-- inputs:ds-tabs -->
All inputs: `selectedIndex: number = 0`, `variant: 'line' | 'pills' = 'line'`, `lazy: boolean = false`, `scrollable: boolean = false`, `closable: boolean = false`, `orientation: 'horizontal' | 'vertical' = 'horizontal'`, `urlParam: string = ''`, `rememberLastTab: boolean = false`
<!-- /inputs -->

#### `<ds-stepper>` — `StepperComponent`
Inputs: `steps: readonly string[] = []`, `current: number = 0`. Horizontal step indicator with done/active/upcoming nodes.

<!-- inputs:ds-stepper -->
All inputs: `steps: readonly string[] = []`, `current: number = 0`, `labelPosition: 'bottom' | 'inline' = 'bottom'`, `orientation: 'horizontal' | 'vertical' = 'horizontal'`, `clickable: boolean = false`, `errorSteps: readonly number[] = []`
<!-- /inputs -->

#### `<ds-pagination>` — `PaginationComponent`
Inputs: `total: required number`, `pageSize: model<number> = 10`, `currentPage: model<number> = 1`, `pageSizeOptions: number[] = [10, 25, 50, 100]`, `showLabel: boolean = true`, `size: DsSize | null = null` (unset resolves `DS_CONFIG.pagination.size`, then `DS_CONFIG.control.size`, then `sm`), `layout: PaginationLayout | null = null` (`'grouped' | 'spread'`; unset resolves `DS_CONFIG.pagination.layout`, then `'grouped'`; `'spread'` gives the nav full width and pushes the label and the controls to opposite edges), `loading: boolean = false` (the page buttons take `aria-disabled` and ignore presses but stay focusable, so a page pressed from the keyboard keeps focus while the host fetches; the size select disables, the range label is masked with a `ds-skeleton` so a stale `total` is never quoted, and the nav reports `aria-busy`). Inside `ds-table` `size` and `layout` arrive as `paginationSize` / `paginationLayout`, and `loading` is set from `loading="skeleton"`. With `total` at 0 the label is `DS_INTL.pagination.range(0, 0, 0)`, `Showing 0 of 0` by default, and every page button is disabled with none marked current.
Outputs: `(currentPageChange): number`, `(pageSizeChange): number`
Previous and Next disable on the first and last page; pressing one onto that page moves focus to the current page's button.

<!-- inputs:ds-pagination -->
All inputs: `total: required number`, `pageSize: number = 10`, `currentPage: number = 1`, `pageSizeOptions: number[]`, `showLabel: boolean = true`, `showPageSize: boolean = true`, `size: 'sm' | 'md' | 'lg' = null`, `layout: 'grouped' | 'spread' = null`, `loading: boolean = false`
<!-- /inputs -->

#### `<ds-divider>` — `DividerComponent`
Inputs: `variant: 'default' | 'strong' | 'vertical' | 'label' = 'default'`, `spacing: 'none' | 'sm' | 'md' | 'lg' = 'md'`
Content: label text (when `variant="label"`).

<!-- inputs:ds-divider -->
All inputs: `variant: 'default' | 'strong' | 'vertical' | 'label' = 'default'`, `spacing: 'none' | 'sm' | 'md' | 'lg' = 'md'`
<!-- /inputs -->

---

#### `<ds-container>` — `ContainerComponent`

<!-- inputs:ds-container -->
All inputs: `size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'xl'`
<!-- /inputs -->

#### `<ds-inline>` — `InlineComponent`

<!-- inputs:ds-inline -->
All inputs: `gap: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' = null`, `align: 'start' | 'center' | 'end' | 'stretch' = null`, `justify: 'start' | 'center' | 'end' | 'between' = null`, `wrap: boolean = true`
<!-- /inputs -->

#### `<ds-stack>` — `StackComponent`

<!-- inputs:ds-stack -->
All inputs: `gap: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' = null`, `align: 'start' | 'center' | 'end' | 'stretch' = null`
<!-- /inputs -->

#### `<ds-sidenav-footer>` — `SidenavFooterComponent`

<!-- inputs:ds-sidenav-footer -->
All inputs: `userName: string = ''`, `userRole: string = ''`, `alerts: boolean = false`, `collapsed: boolean = false`, `searchProvider: SidenavSearchProvider | null = null`, `alertItems: readonly SidenavAlertItem[] | null = null`, `profileRoute: string = ''`
<!-- /inputs -->

#### `<ds-tab>` — `TabComponent`

<!-- inputs:ds-tab -->
All inputs: `label: required string`, `icon: IconName | null = null`, `count: number | null = null`, `disabled: boolean = false`, `value: string | null = null`
<!-- /inputs -->

### Surfaces

#### `<ds-card>` — `CardComponent`
Inputs: `elevation: 'flat' | 'raised' | 'hover' | 'interactive' = 'flat'`, `padding: 'none' | 'sm' | 'md' | 'lg' | null = null` (when `null`, no `padding-*` class is applied and the consumer controls padding via own CSS or `--ds-card-padding`)
Output: `(pressed): MouseEvent` — fires only when `elevation="interactive"`
Tokens: `--ds-card-bg-color`, `--ds-card-border`, `--ds-card-radius`, `--ds-card-padding`, `--ds-card-shadow`, `--ds-card-shadow-hover`, `--ds-card-hover-lift`, `--ds-card-overflow`. The focus ring is not a card token — set `--focus-ring-color`, `--focus-ring-width` or `--focus-ring-offset` on the card's own scope
Full-bleed child: a child whose background reaches the card edge paints square corners over the radius, and the host cannot fix it — the rounded box is the card's inner element. Set `--ds-card-overflow: clip` (`clip`, not `hidden`, so the card stays out of the scroll-container business). It is opt-in because a clipped card also cuts the focus ring off a child at its edge; where the clipped card holds focusable content, pair it with `data-focus="inset"`.
Convention tokens (consumer-side `.title` projected into the card slot — declared at `:root`, not on the host): `--card-title-fs` (default `var(--font-size-h4)` = 22px; a brand can step it down to `var(--font-size-h5)`). Consumer markup: `<h3 class="title">…</h3>`; local `.title` class reads the token via `font:` shorthand together with `--font-weight-bold` / `--line-height-snug` / `--font-heading`.

<!-- inputs:ds-card -->
All inputs: `elevation: 'flat' | 'raised' | 'hover' | 'interactive' = null`, `padding: 'none' | 'sm' | 'md' | 'lg' = null`
<!-- /inputs -->

#### `<ds-accordion>` + `<ds-accordion-item>` — `AccordionComponent`, `AccordionItemComponent`
Accordion is a thin wrapper that rounds + borders its children. Item inputs: `title: string = ''`, `expanded: model<boolean> = false`. Content slots on item: default (body), `[badge]` (rendered next to the title in the header). `chevron: 'right' | 'down' = 'right'` on `<ds-accordion>` sets every item's chevron: `right` turns down when an item opens, `down` turns up. Header geometry and type are tokens on the item (`--ds-accordion-header-padding`, `-header-gap`, `-header-font-family` / `-font-size` / `-font-weight` / `-line-height`, `-header-hover-text-color`) and so is the body padding (`--ds-accordion-body-padding`); both padding tokens take the CSS shorthand, as `--ds-card-padding` does.

<!-- inputs:ds-accordion -->
All inputs: `multiple: boolean = true`, `chevron: 'right' | 'down' = 'right'`
<!-- /inputs -->

---

#### `<ds-accordion-item>` — `AccordionItemComponent`

<!-- inputs:ds-accordion-item -->
All inputs: `title: required string`, `expanded: boolean = false`, `disabled: boolean = false`
<!-- /inputs -->

### Overlay

#### `<ds-modal>` — `ModalComponent`
Inputs: `open: model<boolean> = false`, `size: 'sm' | 'md' | 'lg' = 'md'`, `danger: boolean = false`, `title: required string`
Output: `(closed): void` — fires on backdrop click, close button, or `open` being set to false. `(confirmed)` is declared on the component but no internal handler emits it; treat it as not implemented and emit confirmation from the consumer-side action button instead.
Content slots: `[eyebrow]`, `[title-badge]`, `[body]`, `[impact]` (highlighted strip under the body for destructive consequences), `[actions]` (footer button row). Content with no slot attribute, or with an attribute that names no slot, renders in the body after `[body]`. Backdrop click + close button close the dialog.

`actions` goes on each button or on one `<div actions>` around them; the wrapper's children lay out as the row's own items, with the same gap, alignment and stacking. A `display` you set on the wrapper replaces that.

```html
<ds-modal title="Unarchive program" [(open)]="open">
  <div body>...</div>
  <ds-button actions variant="outline" (pressed)="open.set(false)">Cancel</ds-button>
  <ds-button actions (pressed)="confirm()">Unarchive</ds-button>
</ds-modal>

<ds-modal title="Unarchive program" [(open)]="open">
  <div body>...</div>
  <div actions>
    <ds-button variant="outline" (pressed)="open.set(false)">Cancel</ds-button>
    <ds-button (pressed)="confirm()">Unarchive</ds-button>
  </div>
</ds-modal>
```

<!-- inputs:ds-modal -->
All inputs: `open: boolean = false`, `size: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen' = 'md'`, `status: 'info' | 'success' | 'warning' | 'error' = null`, `title: required string`, `subtitle: string | null = null`, `dividers: boolean | null = null`, `closeOnBackdrop: boolean = true`, `persistent: boolean = false`, `staticPreview: boolean = false`
<!-- /inputs -->

#### `<ds-modal-card>` — `ModalCardComponent`
The visual card the `<ds-modal>` host renders inside its backdrop. Exposed as a separate selector for cases where you need custom positioning (e.g. inside a drawer) without re-implementing the dialog chrome. Inputs: `size`, `danger`, `title: required`, `showClose: boolean = true`. Output: `(closed)`. Slots: `[eyebrow]`, `[title-badge]`, `[body]`, `[impact]`, `[actions]`; content with no slot attribute renders in the body, as in `<ds-modal>`. `actions` goes on each button or on one `<div actions>` around them, as on `<ds-modal>`.

<!-- inputs:ds-modal-card -->
All inputs: `size: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen' = 'md'`, `status: 'info' | 'success' | 'warning' | 'error' = null`, `title: required string`, `subtitle: string | null = null`, `showClose: boolean = true`, `dividers: boolean | null = null`, `icon: IconName | null = null`, `dialogRole: 'dialog' | 'alertdialog' = null`
<!-- /inputs -->

#### `<ds-drawer>` — `DrawerComponent`
Side panel (no `side` input — always anchored right).
Inputs: `open: model<boolean> = false`, `size: 'md' | 'lg' = 'md'`, `title: string = ''`
Output: `(closed): void`
Content slots: `[drawer-body]` (or `[body]`), `[drawer-footer]` (or `[actions]`). Content with no slot attribute, or with an attribute that names no slot, renders in the body. `actions` (or `drawer-footer`) goes on each button or on one `<div actions>` around them; both lay out the same.

<!-- inputs:ds-drawer -->
All inputs: `open: boolean = false`, `size: 'sm' | 'md' | 'lg' = 'md'`, `placement: 'right' | 'left' | 'top' | 'bottom' = 'right'`, `title: required string`, `staticPreview: boolean = false`
<!-- /inputs -->

#### `<ds-bottom-sheet>` — `BottomSheetComponent`
Mobile-first panel anchored to the bottom edge (touch equivalent of drawer/modal). Drag-down on the grab strip, scrim tap, or Esc dismisses; body scroll locks while open; caps width + centres on wide viewports.
Inputs: `open: model<boolean> = false`, `title: string = ''`
Output: `(closed): void`
Content slots: default (body), `[actions]` (footer). `actions` goes on each button or on one `<div actions>` around them; both stack the same.

<!-- inputs:ds-bottom-sheet -->
All inputs: `open: boolean = false`, `title: required string`, `snapPoints: readonly number[] = []`, `staticPreview: boolean = false`
<!-- /inputs -->

#### `<ds-popover>` — `PopoverComponent`
Floating panel anchored to a trigger via CDK overlay. Input: `align: 'start' | 'end' = 'start'` — controls overlay alignment relative to the trigger (`start` = left-edge anchored, `end` = right-edge anchored). Open via the component method `toggle(triggerElement)` (or `close()`), and project the panel body inside a `<ng-template #panel>` (read internally via `viewChild`).

<!-- inputs:ds-popover -->
All inputs: `align: 'start' | 'end' = 'start'`, `placement: 'top' | 'bottom' | 'left' | 'right' = 'bottom'`, `arrow: boolean = false`, `panelRole: string | null = null`, `panelLabel: string | null = null`, `staticPreview: boolean = false`
<!-- /inputs -->

#### `[dsTooltip]` — `TooltipDirective`
Attribute directive, applied by `dsTooltip` or by `dsTooltipWhenClipped` alone. Apply to any focusable element; with `dsTooltipWhenClipped` also to a label that cannot take focus.
Inputs: `dsTooltip: string | TemplateRef<unknown> = ''` (the text; empty disables; `**bold**` renders bold, `\*\*` is a literal `**`, nothing else is parsed. A `TemplateRef` is rendered in the panel as given, with no `**bold**` parsing and no lead text; keep it non-interactive), `dsTooltipPlacement: 'top' | 'bottom' | 'left' | 'right' = 'top'`, `dsTooltipDelay: number = 120` (ms), `dsTooltipArrow: boolean = true` (draws the arrow that points at the host; `[dsTooltipArrow]="false"` leaves it out), `dsTooltipWhenClipped: boolean | string = false` (open only while the host shows less text than it holds; without a `dsTooltip` it discloses the tested text. A selector in place of a boolean aims the test and the text at the element it matches inside the host, so a whole row can be the hover area for the label inside it: `<button dsTooltip dsTooltipWhenClipped=".label"><span class="label">…</span></button>`; resolved on every open, and while nothing matches no clipped tip opens), `dsTooltipPinOnClick: boolean = false` (opens with no delay; a click on the host keeps the tip open after the pointer leaves until a click outside, `Escape` or blur, and a second click closes it; without it a click closes the tip. While pinned the host carries `data-ds-tooltip-pinned`. Every pinned trigger of the library shows one cue, `--accent-strong` ink with no fill, plus a 2px solid accent underline on a text trigger; a pinned text trigger thickens the line to 3px on hover and takes the `--surface-muted` press fill on press, a pinned icon takes a `--surface-muted` circle on hover and a `--border-default` circle on press; give your own trigger the same cue with `@use 'styles/pinned' as pinned;` and `&[data-ds-tooltip-pinned] { @include pinned.cue(); }`. For info and definition triggers only, never on a control whose click acts)
Renders `<ds-tooltip-panel>` via CDK overlay on hover / focus; hides on leave / blur. A line break in the text shows as a line break; runs of spaces collapse. A `dsTooltip` shows exactly its text; only a `dsDefinitionTerm` leads with its own text, in bold, then a line break, unless the tip already contains that text. A `dsTooltipWhenClipped` host that cannot take focus (a label inside a button, a cell of a clickable row) also opens when keyboard focus lands on its nearest focusable ancestor, and closes on that ancestor's blur, click or any key; a `dsTooltipWhenClipped` host that takes focus itself opens on keyboard focus and closes on its own blur, click or any key; a mouse click opens nothing, and of several clipped hosts in one ancestor only the first in document order opens. A clipped `dsTooltipWhenClipped` host that no keyboard path reaches - not focusable, inside no control or widget role, holding no control - takes `tabindex="0"` while it is clipped and loses it once its text fits and it is not focused; a `tabindex` you set is never touched, and `tabindex="-1"` keeps a clipped value out of the Tab order. A clipped tip whose text the host already contains sets no `aria-describedby` (the text is in the DOM already); a `dsTooltip` that says more than the host, and a plain `dsTooltip`, describe the focused element. A plain `dsTooltip` on a non-focusable element stays hover-only: put an info tooltip on its own focusable element, not inside a button. The panel wraps a value with no break opportunity (a file name, an id) inside its max width.

<!-- inputs:[dsTooltip] -->
All inputs: `dsTooltip: string = ''`, `dsTooltipPlacement: 'top' | 'bottom' | 'left' | 'right' = 'top'`, `dsTooltipDelay: number = 120`, `dsTooltipArrow: boolean = true`, `dsTooltipWhenClipped: boolean = false`, `dsTooltipPinOnClick: boolean = false`, `dsTooltipTextSelector: string | null = null`
<!-- /inputs -->

#### `<ds-info-hint>` — `InfoHintComponent`
An icon button (14px, a question mark in a circle by default; `icon="info"` draws an "i", and `icon` takes any `IconName`) that shows supplementary content on hover and focus and keeps it open on click (a toggletip): `<ds-info-hint ariaLabel="About conversion rate" text="Share of contacts who reached the goal." />`. The content describes the button through `aria-describedby` while open. A click outside, `Escape` or blur closes it. The icon darkens on hover, sits on a muted circle while pressed, and turns `--accent-strong` while pinned. Place it after the label it explains.

Rich content comes two ways, both rendered in the same `role="tooltip"` panel:

```html
<ds-info-hint ariaLabel="When v4 was published">
  <strong>Published</strong>
  <ul><li>v4 · 29 Sep 2026, 14:32</li></ul>
</ds-info-hint>

<ds-info-hint ariaLabel="When v4 was published" [content]="published" />
<ng-template #published>
  <strong>Published</strong>
  <ul><li>v4 · 29 Sep 2026, 14:32</li></ul>
</ng-template>
```

Exactly one source shows: `[content]` first, then projected content, then `text` (with its `**bold**` runs). In dev mode a hint given more than one, or none, logs a console warning naming what it shows. Projected content is created with the hint, even while it is closed; a `[content]` template is created only when the panel opens, so prefer it in a long list or table. Keep the content non-interactive: the panel never takes focus, so a link or button in it cannot be reached by keyboard. A screen reader reads the description as flat text, without the list structure. The panel stays within `--ds-tooltip-max-width`.

The icon is painted `--icon-default`; set `--ds-info-hint-color` on the hint to colour it, as `ds-info-hint.removed { --ds-info-hint-color: var(--warning-text); }` beside `icon="warn"`. A custom colour stays on hover; the pressed circle and the pinned cue are unchanged.

<!-- inputs:ds-info-hint -->
All inputs: `text: string = ''`, `content: TemplateRef<unknown> | null = null`, `ariaLabel: required string`, `icon: IconName = 'help'`
<!-- /inputs -->

#### `[dsDefinitionTerm]` — `DefinitionTermDirective`
Directive, on any element: a term inside running text or a label that carries its definition, `<span dsDefinitionTerm="Left the journey before the goal step.">exited</span>`. The text in `dsDefinitionTerm` is the tooltip; no `dsTooltip` is needed. The term keeps the surrounding text style with a dotted underline in `--text-tertiary`, takes the focus ring, and shows the definition on hover and focus; a click pins it until a click outside, `Escape` or blur. On a host other than `<button>` it adds `tabindex="0"`, `role="button"`, and `Enter` / `Space` act as a click; a `<button>` gets `type="button"` and its native behaviour. It brings its own styles (`.ds-definition-term`); no stylesheet import is needed. Hover makes the underline solid in `--text-secondary`, a press (a click held, or `Enter` / `Space` held on a non-button) tints the term with `--surface-muted`, and while pinned it turns `--accent-strong` with a 2px solid accent underline, 3px on hover and with the `--surface-muted` fill while pressed; no state changes its size. `[pinOnClick]="false"` where the click already acts, such as a sort button. Also takes `dsTooltipPlacement`.

<!-- inputs:[dsDefinitionTerm] -->
All inputs: `pinOnClick: boolean = true`, `dsDefinitionTerm: string | TemplateRef<unknown> = ''`, `dsTooltipPlacement: 'top' | 'bottom' | 'left' | 'right' = 'top'`
<!-- /inputs -->

#### `<ds-menu>` + `<ds-menu-item>` — `MenuComponent`, `MenuItemComponent`
Menu is a container. Item inputs: `icon: IconName | null = null`, `disabled: boolean = false`, `danger: boolean = false`. Output: `(pressed): MouseEvent`. Content: label text; supports `[icon]` content slot for custom icons. A `[submenu]` opens on hover after 120ms and stays open while the pointer moves from its item towards it, across the items in between; it closes once the pointer leaves that path or rests on it for 300ms.

<!-- inputs:ds-menu-item -->
All inputs: `icon: IconName | null = null`, `disabled: boolean = false`, `error: boolean = false`, `quiet: boolean = false`, `description: string = ''`, `submenu: TemplateRef<unknown> | null = null`
<!-- /inputs -->

---

#### `<ds-tooltip-panel>` — `TooltipPanelComponent`

<!-- inputs:ds-tooltip-panel -->
All inputs: `text: required string | TemplateRef<unknown>`, `placement: required 'top' | 'bottom' | 'left' | 'right'`, `arrow: boolean = true`, `panelId: string = ''`
<!-- /inputs -->

### Tables

#### `<ds-table>` — `TableComponent<T extends { id: string }>`
Inputs: `data: required readonly T[]`, `columns: required readonly TableColumn<T>[]`, `selectable: boolean = false`, `bordered: boolean = false` (opt-in outer border + radius; off by default so tables flush inside `<ds-card padding="none">` don't double-border), `loading: false | 'skeleton' | 'overlay' = false`, `stickyHeader: boolean = true`, `selectedIds: model<Set<string>>`, `sortKey: model<string | null>`, `sortDirection: model<SortDirection>` (`'asc' | 'desc' | null`), `skeletonRows: number = 5`
Outputs: `(rowClicked): T`, `(sortChange): SortChangeEvent` (`{ key, dir }`)
Column shape: `{ key: string, label: string, sortable?: boolean, align?: 'left' | 'right' | 'center', cell?: (row: T) => string, hint?: string }`
Column hint: `hint` defines the column's term. The header label gets a dotted underline in `--text-tertiary` and shows the hint in a `dsTooltip` on hover and keyboard focus, set as the label's `aria-describedby` while open. A sortable label keeps its sort button as the only Tab stop; a plain label with a hint renders as a `button[dsDefinitionTerm]`, whose click pins the hint, and stays a plain `<span>` without one; a sortable label's click sorts and pins nothing. While the label is clipped the tooltip shows the label in bold on its first line and the hint under it; otherwise it shows the hint alone, and a clipped label's `aria-describedby` text carries both. A column without `hint` renders unchanged.
Opening a row: give one column `link: (row) => <route target> | null` and its value renders as a real `<a>` — visible without hovering, in the tab order as a link, and Ctrl/Cmd-clickable, none of which a clickable `<tr>` can do. `null` for a row leaves that cell as plain text, so a partly-reachable list stays one column; external URLs go through a `[dsCellTemplate]` instead, since `link` takes Angular route targets only. It composes with `rowInteractive` (the link stops its click from reaching the row), but the two together cost **two tab stops per row** — on a long list prefer the link alone. `interactive: true` only tints a cell on row hover, which a keyboard or touch user never sees; prefer `link` wherever the row actually leads somewhere.
Cell templates: `<ng-template dsCellTemplate="<colKey>" [dsCellTemplateOf]="rows" let-row>…</ng-template>` — bound to the same rows as `[data]`, `dsCellTemplateOf` types `row` as `T` under strict templates (a field typo is a compile error) and is never read at runtime. Without it `row` is `unknown`; narrow via a helper method on the host. `CellTemplateContext<T>` (`$implicit` and `row`) is exported.
Content slots: `[empty]` (rendered when `data.length === 0`), `[bulk-actions]` (rendered in the bulk action bar when `selectable && some selected`)
Loading modes: `'skeleton'` replaces rows with `ds-skeleton` shimmer placeholders; `'overlay'` keeps existing rows visible behind a translucent layer with a centred spinner; under `'skeleton'` the footer pager takes `loading` as well - its controls disable and its range label is masked, so it never quotes the previous query's count. `'overlay'` leaves the pager live, like the header.
Footer pager: `pageSizeOptions`, `showPageSize`, `showLabel`, `paginationSize: DsSize | null = null` and `paginationLayout: PaginationLayout | null = null` are the embedded `ds-pagination`'s own inputs forwarded one-to-one; the last two unset resolve `DS_CONFIG.pagination.size` (then `DS_CONFIG.control.size`, then `sm`) and `DS_CONFIG.pagination.layout` (then `'grouped'`), so an app whose every pager wants `md` / `spread` says it once in the config. A paged table with no rows announces its empty state's text (`[empty]` or `emptyTemplate`); with none it announces `rangeAnnouncement(0, 0, 0)`, `Showing 0 of 0` by default.
Tokens: `--ds-table-border: var(--border-default)`, `--ds-table-radius: var(--radius-md)`, `--ds-table-bg-color`, `--ds-table-head-text-color: var(--text-secondary)`, `--ds-table-head-bg-color: var(--surface-secondary)`, `--ds-table-head-font-size: var(--font-size-xs)`, `--ds-table-row-hover-bg-color`, `--ds-table-row-selected-bg-color`, `--ds-table-divider`, `--ds-table-sort-active-icon-color`, `--ds-table-cell-padding-x/y`, `--ds-table-utility-column-width` (the column the column picker and the row-actions ⋮ ride in; default `--space-6`, the buttons' own size, so the column is as wide as its padding makes it) and `--ds-table-utility-column-padding-x` (one length for both sides; default the cell padding chain), `--ds-table-footer-padding-y` / `-top` / `-bottom` (the pagination footer's block padding; default `--space-3`). (Renamed 2026-06: `--ds-table-header-*` → `--ds-table-head-*`, matching the tokens reference.)

<!-- inputs:ds-table -->
All inputs: `data: required readonly T[]`, `rowId: ((row: T) => string) | null = null`, `columns: required readonly TableColumn<T>[]`, `selectable: boolean = false`, `bordered: boolean | null = null`, `loading: boolean | 'skeleton' | 'overlay' = false`, `stickyHeader: boolean = true`, `maxHeight: string | null = null`, `density: 'default' | 'compact' = 'default'`, `zebra: boolean = false`, `animateHeight: boolean = false`, `selectedIds: Set<string>`, `sortKey: string | null = null`, `sortDirection: 'asc' | 'desc' = null`, `sortingOrder: SortDirection[]`, `sortAnnouncement: ((label: string, dir: SortDirection) => string) | null = null`, `rangeAnnouncement: ((first: number, last: number, total: number) => string) | null = null`, `skeletonRows: number = 5`, `caption: string = ''`, `rowInteractive: boolean = false`, `activeRowId: string | null = null`, `filterQuery: string = ''`, `columnFilters: Map<string, ReadonlySet<string>>`, `persistLayout: boolean = false`, `storageKey: string = ''`, `stickyScrollbar: boolean | null = null`, `pageSize: number | null = null`, `page: number = 1`, `pageSizeOptions: number[]`, `showPageSize: boolean = true`, `showLabel: boolean = true`, `paginationSize: 'sm' | 'md' | 'lg' = null`, `paginationLayout: 'grouped' | 'spread' = null`, `total: number | null = null`, `scrollToTopOnPageChange: boolean = false`, `sortMode: 'client' | 'server' | 'none' = null`, `filterMode: 'client' | 'server' | 'none' = null`, `columnFilterOptions: ReadonlyMap<string, readonly string[]>`, `stickyScrollbarOffset: string | null = null`, `stickyFirstColumn: boolean = false`, `virtualScroll: boolean = false`, `virtualRowSize: number = 44`, `lazy: boolean = false`, `rowActions: readonly TableRowAction<T>[] = []`, `cellTemplateMap: Record<string, TemplateRef<{ $implicit: unknown; row: unknown }>> = {}`, `emptyTemplate: TemplateRef<unknown> | null = null`, `expandableRows: boolean = false`, `expandedIds: Set<string>`, `expandMode: 'multiple' | 'single' = 'multiple'`, `expandAllToggle: boolean = false`, `rowExpandTemplate: TemplateRef<{
    $implicit: unknown;
    row: unknown;
  }> | null = null`
<!-- /inputs -->

---

#### `[dsCellTemplate]` — `CellTemplateDirective`

<!-- inputs:[dsCellTemplate] -->
All inputs: `dsCellTemplate: required string`, `dsCellTemplateOf: readonly T[] | null = null`
<!-- /inputs -->

#### `<ng-template[dsHeaderFilter]>` — `HeaderFilterDirective`

<!-- inputs:ng-template[dsHeaderFilter] -->
All inputs: `dsHeaderFilter: required string`, `active: boolean = false`
<!-- /inputs -->

#### `[dsTableColumns]` — `DsTableColumns`
Column panel Move up and Move down keep focus on the moved row: the pressed button, or the other at an end.

<!-- inputs:[dsTableColumns] -->
All inputs: `reorderableColumns: boolean = false`, `hiddenKeys: Set<string> | null = null`, `columnOrder: string[] | null = null`
<!-- /inputs -->

#### `[dsTableExport]` — `DsTableExport`

<!-- inputs:[dsTableExport] -->
All inputs: `dsTableExport: boolean = true`, `exportFilename: string = 'table.csv'`, `exportFetcher: (() => Promise<readonly T[] | Blob | string>) | null = null`
<!-- /inputs -->

### Charts

#### `<ds-bar-chart>` — `BarChartComponent`
Inputs: `data: readonly BarChartRow[]` (required), `max: number | null = null` (track length is relative to this; null uses the largest value, so the longest row always fills its track — a max BELOW the largest value is allowed and its bar clips at the track edge), `caption: string | null = null`, `summary: string | null = null` (accessible name; generated from the data when omitted), `dataTable: 'none' | 'toggle' | 'visible' = 'none'` (`'toggle'` renders a closed `<details>`; `'none'` is only correct when the same numbers are already in the DOM nearby), `showPercent: boolean = true`, `loading: boolean = false`, `emptyText: string = 'No data'`, `error: boolean = false`, `errorText: string = 'Could not load the data'`, `valueFormat: (value: number) => string`, `interactive: boolean = false`, `tooltip: 'item' | 'none' = 'item'`, `staggerMs: number = 40`
Output: `(rowClicked): BarChartRow` — emits the clicked row.
Interaction: `interactive: boolean = false` turns on the affordance — pointer cursor, hover tint and the keyboard route. `dimOthers: boolean = false` is a SEPARATE opt-in that fades every other mark while one is hovered or focused; off by default, because the fade costs the separation between the faded marks (dE 14.8 -> 2.1 at the default dim opacity) — it buys loudness for one mark and pays for it with the rest. The output fires whether or not it is set. The keyboard route is ONE tab stop for the whole chart, not one per mark: arrows walk the marks, Home and End reach the extremes, and the ends wrap. `tooltip: 'item' | 'none' = 'item'` opens a panel for the hovered, tapped or focused mark; a tap latches it until the next tap outside. Project an `<ng-template #dsChartTooltip let-tip>` to replace its contents — `tip` is `{ category: string; entries: { label, value, formatted, color }[] }`.
Motion: marks that leave finish leaving before marks that arrive start. A bar grows out of the value axis, then its value rises in. `staggerMs: number = 40` spaces the arrivals, narrowed so a series finishes arriving within 260ms; `0` brings every mark in at once. Every duration is a `--ds-motion-chart-*` role, so `prefers-reduced-motion` shows every mark at once, delays included.
States: `loading` with an empty `data` draws skeleton rows in the drawn row geometry (label, value, percent and track boxes; under `labelPosition="start"` the label column at its cap); `loading` with rows keeps them under the `ds-loading-overlay` scrim and spinner, inert, as `ds-table` does on a reload; the scrim covers the whole card to its rounded corners. `error` shows `errorText` in place of the plot, which is a different claim from an empty `data` showing `emptyText`.
Row: `BarChartRow = { label: string; value: number; percent?: number; color?: string; children?; hint?; emphasis?; showPercent?; detached? }`. `percent` is derived from `value / max` when omitted.
`value` may be a `[low, high]` pair instead of a number: the bar spans between its own ends rather than from zero, which compares a duration and its PLACEMENT at once, and the ends may be written either way round. `target` draws a tick across the bar at one reading; `ranges` paints qualitative bands behind it, given as their upper bounds in ascending order. Together they are the bullet chart, which is a bar with two extras rather than a chart type. The bands take one neutral hue at rising opacity, never the series palette. Tokens: `--ds-bar-chart-band-color`, `--ds-bar-chart-target-color`, `--ds-bar-chart-target-width`, `--ds-bar-chart-target-overhang`.
Colour: the rows are ONE series, so they all take `--ds-chart-series-default-color`. Set `color` on the single row the reader should land on, usually to `var(--ds-chart-series-accent-color)`. There is no accent flag — the accent is a colour, so a boolean would only be a less flexible way of setting one. Do NOT reach for `--ds-chart-series-1-color` … `-8-color` here: those separate series from one another, and a bar chart's rows are not separate series.
Segments: `segments?: BarChartSegment[]` divides a row's bar into parts sized against their own sum; each takes the categorical palette in order and gets its own nested row in the data table. `highlighted: string | null = null` names one segment by `id` (or its position as a string) and fades every other part in every row to `--ds-chart-dim-opacity` — the same input the series marks take.
Stacking: a bar stacks inside its own row, through `segments`; there is no `stack` input. `ds-column-chart` stacks the other way, across named series with its `stack` input, because a column chart carries series and a bar chart is one series of rows.
Behaviour: a non-finite value draws no bar and prints `—`; a negative value clamps to an empty bar; a share too small for one decimal prints `<0.1%` rather than `0.0%`.
Layout: `labelPosition: 'top' | 'start' = 'top'` (`BarChartLabelPosition`). `'start'` puts each label in a column before its bar, on the bar's line, and lines up labels, bars, values and percents in columns across rows; the label column is capped by `--ds-bar-chart-label-column-max-width` (default `40%`) and the row gap defaults to `--space-3`.
Groups: `children?: BarChartRow[]` nests rows under a row behind a disclosure button after its label, closed at first. A child's bar and derived percent are shares of its parent's value, not of `max`; it takes the parent's `color` and `showPercent` unless it sets its own, draws at `--ds-bar-chart-child-fill-opacity` (default `0.55`), and is listed in the data table whether or not its group is open. One level: a child's own `children` are ignored. With `interactive`, the row itself carries `aria-expanded`, and Right opens a closed group and Left closes an open one.
Rows: `hint?: string` turns the label into a defined term (dotted underline, the hint in a tooltip on hover and keyboard focus, announced as the label's description; the hint is a `dsTooltip` string, so `**bold**` in it renders bold); `emphasis?: boolean` prints the label in bold; `showPercent?: boolean` overrides the chart's `showPercent` for that row; `detached?: boolean` marks a row that is not a part of the others, such as a total of those who finished or left: a dashed divider in `--ds-bar-chart-divider-color` separates it from the row before, and `partOfWhole` gives it no share. A chart with any `hint` or `children` takes `role="group"` instead of `role="img"`, so the buttons inside stay reachable.
Rhythm: a label belongs to the bar under it, so `--ds-bar-chart-label-gap` is deliberately much smaller than `--ds-bar-chart-row-gap`. Level the two and the eye starts grouping a bar with the label BELOW it, which reads every row off by one.
Tokens: `--ds-bar-chart-track-color`, `--ds-bar-chart-track-height`, `--ds-bar-chart-row-gap`, `--ds-bar-chart-label-gap`, `--ds-bar-chart-label-column-max-width`, `--ds-bar-chart-child-fill-opacity`, `--ds-bar-chart-divider-color`.

<!-- inputs:ds-bar-chart -->
All inputs: `frame: 'auto' | 'none' = null`, `caption: string | null = null`, `summary: string | null = null`, `loading: boolean = false`, `error: boolean = false`, `emptyText: string | null = null`, `errorText: string | null = null`, `valueFormat: ChartValueFormat | null = null`, `interactive: boolean = false`, `tooltipSwatches: boolean | null = null`, `tooltipLingerMs: number | null = null`, `pinOnClick: boolean | null = null`, `data: readonly BarChartRow[] = []`, `max: number | null = null`, `dataTable: 'toggle' | 'visible' | 'none' = null`, `partOfWhole: boolean = false`, `showPercent: boolean = true`, `labelPosition: 'top' | 'start' = 'top'`, `dimOthers: boolean = false`, `highlighted: string | null = null`, `staggerMs: number = 40`, `tooltip: 'item' | 'none' = 'item'`
<!-- /inputs -->

#### `<ds-column-chart>` — `ColumnChartComponent`
Vertical columns for a short series read left to right — months, stages, teams — measured against one value axis whose ticks snap to round numbers.
Inputs: `data: readonly ColumnChartPoint[]` (required), `showValues: boolean = true` (each column prints its own value above itself), `tickCount: number = 5` (a hint: ticks snap to a round step, so an axis asked for three ends up with five and one asked for ten stops at eight), `caption: string | null = null`, `summary: string | null = null`, `dataTable: 'none' | 'toggle' | 'visible' = 'none'`, `loading: boolean = false`, `emptyText: string = 'No data'`, `error: boolean = false`, `errorText: string = 'Could not load the data'`, `valueFormat: (value: number) => string`, `interactive: boolean = false`, `tooltip: 'item' | 'none' = 'item'`, `staggerMs: number = 40`, `thresholds: readonly ChartThreshold[] = []`
Output: `(pointClicked): ColumnChartPoint` — same contract as `ds-bar-chart`'s `rowClicked`.
Interaction: `interactive: boolean = false` turns on the affordance — pointer cursor, hover tint and the keyboard route. `dimOthers: boolean = false` is a SEPARATE opt-in that fades every other mark while one is hovered or focused; off by default, because the fade costs the separation between the faded marks (dE 14.8 -> 2.1 at the default dim opacity) — it buys loudness for one mark and pays for it with the rest. The output fires whether or not it is set. The keyboard route is ONE tab stop for the whole chart, not one per mark: arrows walk the marks, Home and End reach the extremes, and the ends wrap. `tooltip: 'item' | 'none' = 'item'` opens a panel for the hovered, tapped or focused mark; a tap latches it until the next tap outside. Project an `<ng-template #dsChartTooltip let-tip>` to replace its contents — `tip` is `{ category: string; entries: { label, value, formatted, color }[] }`.
Motion: marks that leave finish leaving before marks that arrive start. A column grows out of its baseline, then its value rises in. `staggerMs: number = 40` spaces the arrivals, narrowed so a series finishes arriving within 260ms; `0` brings every mark in at once. Every duration is a `--ds-motion-chart-*` role, so `prefers-reduced-motion` shows every mark at once, delays included.
States: `loading` draws skeleton marks at the real count; `error` shows `errorText` in place of the plot, which is a different claim from an empty `data` showing `emptyText`.
Point: `ColumnChartPoint = { label: string; value: number; color?: string }`
Thresholds: `ChartThreshold = { value: number; label?: string; color?: string; to?: number; dash?: 'solid' | 'dashed' | 'dotted' }` draws a target, a budget or an SLA across the plot, behind the columns. ONE number, not a coordinate pair; `to` makes the same object a band between two readings, in either order; `dash` defaults to `'dashed'`. A threshold widens the value axis to hold it, and is named in the generated description, so a target above every column is neither drawn off the plot nor left unsaid.
Colour: the categorical palette by position — `--ds-chart-series-1-color` onward. Set `color` on a column that carries a meaning its position does not, such as `var(--ds-chart-series-accent-color)` on the period the reader should land on. This is the one chart where the default is a judgement call rather than a rule: columns often ARE separate things (revenue by region), and where they are one quantity over time, `color` puts every column on `--ds-chart-series-default-color` in one pass.
Stacking: `stack` piles named series within each category; a point carries no breakdown of its own. `ds-bar-chart` stacks the other way, inside one row through `segments`.
Legend: `legendFilters` lets the legend hide series through the two-way `hiddenSeries`; a hidden series' columns sink to the baseline and the rest re-pile. The value axis re-scales to what is left; `rescaleOnHide: false` holds it where it stands with every series shown, as on `ds-line-chart`.
Tokens: `--ds-column-chart-plot-height`, `--ds-column-chart-column-width` (share of its own cell), `--ds-column-chart-column-max-width` (the cap that stops a five-column chart drawing slabs wider than their labels), `--ds-column-chart-column-gap`, `--ds-column-chart-grid-line-color`, `--ds-column-chart-value-space` (headroom for the value printed above a full-height column), `--ds-column-chart-axis-width` (the tick-label column; widen it for a `valueFormat` that prints longer ticks, which are clipped rather than wrapped). Reference lines take `--ds-chart-threshold-color`, `--ds-chart-threshold-band-opacity`, `--ds-chart-threshold-dashed-pattern` and `--ds-chart-threshold-dotted-pattern`.

<!-- inputs:ds-column-chart -->
All inputs: `frame: 'auto' | 'none' = null`, `caption: string | null = null`, `summary: string | null = null`, `loading: boolean = false`, `error: boolean = false`, `emptyText: string | null = null`, `errorText: string | null = null`, `valueFormat: ChartValueFormat | null = null`, `interactive: boolean = false`, `tooltipSwatches: boolean | null = null`, `tooltipLingerMs: number | null = null`, `pinOnClick: boolean | null = null`, `data: readonly ColumnChartPoint[] | readonly ColumnChartSeries[] = []`, `stack: 'none' | 'grouped' | 'stacked' | 'normalized' = 'none'`, `thresholds: readonly ChartThreshold[] = []`, `showValues: boolean = true`, `skeletonCount: number`, `tickCount: number = 5`, `dataTable: 'toggle' | 'visible' | 'none' = null`, `partOfWhole: boolean = false`, `dimOthers: boolean = false`, `staggerMs: number = 40`, `tooltip: 'item' | 'none' = 'item'`, `hiddenSeries: readonly string[] = []`, `rescaleOnHide: boolean = true`, `legendFilters: boolean = false`, `legendMode: 'toggle' | 'isolate' = 'isolate'`, `selectRange: boolean = false`, `showAxisReadout: boolean = true`, `tooltipAnchor: 'mark' | 'cell' = 'mark'`
<!-- /inputs -->

#### `<ds-pie-chart>` — `PieChartComponent`
A ring that splits one total into its parts, with the middle free for the total or a headline figure of your own.
Inputs: `data: readonly PieChartSlice[]` (required), `centerValue: string | null = null`, `centerLabel: string | null = null`, `legend: 'end' | 'bottom' | 'none' = 'end'`, `maxSlices: number | null = null`, `otherLabel: string | null = null` (unset: `DS_INTL.chart.other`), `innerRadius: number = 0.68`, `caption: string | null = null`, `summary: string | null = null`, `dataTable: 'none' | 'toggle' | 'visible' = 'none'`, `loading: boolean = false`, `emptyText: string = 'No data'`, `error: boolean = false`, `errorText: string = 'Could not load the data'`, `valueFormat: (value: number) => string`, `interactive: boolean = false`, `tooltip: 'item' | 'none' = 'item'`
Output: `(sliceClicked): PieChartSlice`
Interaction: `interactive: boolean = false` turns on the affordance — pointer cursor, hover tint and the keyboard route. `dimOthers: boolean = false` is a SEPARATE opt-in that fades every other mark while one is hovered or focused; off by default, because the fade costs the separation between the faded marks (dE 14.8 -> 2.1 at the default dim opacity) — it buys loudness for one mark and pays for it with the rest. The output fires whether or not it is set. The keyboard route is ONE tab stop for the whole chart, not one per mark: arrows walk the marks, Home and End reach the extremes, and the ends wrap. `tooltip: 'item' | 'none' = 'item'` opens a panel for the hovered, tapped or focused mark; a tap latches it until the next tap outside. Project an `<ng-template #dsChartTooltip let-tip>` to replace its contents — `tip` is `{ category: string; entries: { label, value, formatted, color }[] }`.
Motion: the RING turns into place as one object rather than slice by slice - arcs share their edges, and moving them one at a time lets the background through every seam. The legend swatches and the centre follow once it has landed. Marks that leave finish leaving before marks that arrive start. Every duration is a `--ds-motion-chart-*` role, so `prefers-reduced-motion` shows the ring at once.
States: `loading` draws skeleton marks at the real count; `error` shows `errorText` in place of the plot, which is a different claim from an empty `data` showing `emptyText`.
Slice: `PieChartSlice = { id: string; label: string; value: number; slot?: number }`. `slot` is a 1-based palette slot: pinning a slice keeps every other slice's colour where it is when one is filtered out of `data`; left off, the colour follows the index and the whole ring repaints.
Colour: slices ARE different things, so this is the chart the categorical palette exists for — `--ds-chart-series-1-color` … `--ds-chart-series-8-color`.
Legend: an entry under the pointer or holding keyboard focus takes a tint and the primary text colour and answers as its slice does: the slice slides out, the centre names it, and the other slices fade only under `dimOthers`.
Centre on hover: while a slice is hovered, focused or held, the centre fades to that slice's share (its value under `partOfWhole: false`) over its name, and back to the total when the pointer leaves; `showHoverCenter: false` keeps `centerValue` and `centerLabel` there.
Behaviour: percentages use largest-remainder rounding, so a legend's shares add up to exactly 100 and a real non-zero slice never prints `0%`.
`maxSlices` caps the legend: past it the smallest slices are summed into one named by `otherLabel`, which takes the neutral eighth palette slot. Off by default, because grouping changes what the chart says. The kept slices stay in the order given rather than being re-sorted by value, and the total is unchanged — the tail is summed, never dropped. A limit below 2 is ignored.
`innerRadius: 0` closes the hole into a pie, and the centre content goes with it: `centerValue` and `centerLabel` render only where there is a hole to hold them. A value outside [0, 1) falls back to the default rather than drawing nothing. The centre box is held to the square that fits inside the hole with a 56% floor, so a long value can overhang the ring; a halo of the chart's own background carries it there.
Tokens: `--ds-pie-chart-size`, `--ds-pie-chart-gap`, `--ds-pie-chart-swatch-size`, `--ds-pie-chart-legend-row-gap`, `--ds-pie-chart-legend-row-height`, `--ds-chart-legend-hover-bg-color` and `--ds-chart-legend-hover-text-color` (shared with every chart legend), `--ds-pie-chart-outline-width` (the placeholder ring drawn when there is no data and when every slice is zero).

<!-- inputs:ds-pie-chart -->
All inputs: `frame: 'auto' | 'none' = null`, `caption: string | null = null`, `summary: string | null = null`, `loading: boolean = false`, `error: boolean = false`, `emptyText: string | null = null`, `errorText: string | null = null`, `valueFormat: ChartValueFormat | null = null`, `interactive: boolean = false`, `tooltipSwatches: boolean | null = null`, `tooltipLingerMs: number | null = null`, `pinOnClick: boolean | null = null`, `data: readonly PieChartSlice[] = []`, `centerValue: string | null = null`, `centerLabel: string | null = null`, `centerCompact: boolean = true`, `centerPlacement: 'inside' | 'below' = 'inside'`, `showHoverCenter: boolean = true`, `legend: 'end' | 'bottom' | 'none' = 'end'`, `skeletonCount: number`, `maxSlices: number | null = null`, `otherLabel: string | null = null`, `innerRadius: number = 0.68`, `dataTable: 'toggle' | 'visible' | 'none' = null`, `partOfWhole: boolean = true`, `dimOthers: boolean = false`, `tooltip: 'item' | 'none' = 'item'`
<!-- /inputs -->

#### `<ds-funnel-chart>` — `FunnelChartComponent`
Stages of a journey, drawn top to bottom in the order you give them — they are never sorted, because the order is the meaning.
Inputs: `data: readonly FunnelChartStage[]` (required), `shape: 'taper' | 'width' | 'area' = 'area'`, `showTable: boolean = true` (the aligned stage table under the funnel: value, share of the first stage, and how much fell away since the stage above), `caption: string | null = null`, `summary: string | null = null`, `dataTable: 'none' | 'toggle' | 'visible' = 'none'`, `loading: boolean = false`, `emptyText: string = 'No data'`, `error: boolean = false`, `errorText: string = 'Could not load the data'`, `valueFormat: (value: number) => string`, `interactive: boolean = false`, `tooltip: 'item' | 'none' = 'item'`, `staggerMs: number = 60`
Output: `(stageClicked): FunnelChartStage`
Interaction: `interactive: boolean = false` turns on the affordance — pointer cursor, hover tint and the keyboard route. `dimOthers: boolean = false` is a SEPARATE opt-in that fades every other mark while one is hovered or focused; off by default, because the fade costs the separation between the faded marks (dE 14.8 -> 2.1 at the default dim opacity) — it buys loudness for one mark and pays for it with the rest. The output fires whether or not it is set. The keyboard route is ONE tab stop for the whole chart, not one per mark: arrows walk the marks, Home and End reach the extremes, and the ends wrap. `tooltip: 'item' | 'none' = 'item'` opens a panel for the hovered, tapped or focused mark; a tap latches it until the next tap outside. Project an `<ng-template #dsChartTooltip let-tip>` to replace its contents — `tip` is `{ category: string; entries: { label, value, formatted, color }[] }`.
Motion: marks that leave finish leaving before marks that arrive start. Stages rise in from the top, and each table row follows its stage. `staggerMs: number = 60` spaces the arrivals, narrowed so a series finishes arriving within 260ms; `0` brings every mark in at once. Every duration is a `--ds-motion-chart-*` role, so `prefers-reduced-motion` shows every mark at once, delays included.
States: `loading` draws skeleton marks at the real count; `error` shows `errorText` in place of the plot, which is a different claim from an empty `data` showing `emptyText`.
Stage: `FunnelChartStage = { id: string; label: string; value: number }`
Shape: `'area'` is the default — the fixed silhouette with the stage boundaries moved so each band's AREA is proportional to its value, the honest encoding that still leaves a labellable tail. `'width'` reads every boundary straight off the values, which collapses the tail of a steep funnel below a labellable width. `'taper'` encodes NOTHING: the silhouette is fixed whatever the data, so editing the values moves the table and never the shape — reach for it only where the numbers are read from the table.
`dataTable` is suppressed while `showTable` is on: with both, the same numbers print twice.
Colour: the stages are one quantity draining, not N categories, so they take the single-hue ramp `--ds-chart-ramp-1-color` … `--ds-chart-ramp-8-color`, spread across however many stages there are. The LAST stage leaves the ramp for `--ds-chart-series-accent-color` — it is the outcome the funnel is read for.
Tokens: `--ds-funnel-chart-stage-height`, `--ds-funnel-chart-stage-gap`, `--ds-funnel-chart-row-gap`.

<!-- inputs:ds-funnel-chart -->
All inputs: `frame: 'auto' | 'none' = null`, `caption: string | null = null`, `summary: string | null = null`, `loading: boolean = false`, `error: boolean = false`, `emptyText: string | null = null`, `errorText: string | null = null`, `valueFormat: ChartValueFormat | null = null`, `interactive: boolean = false`, `tooltipSwatches: boolean | null = null`, `tooltipLingerMs: number | null = null`, `pinOnClick: boolean | null = null`, `data: readonly FunnelChartStage[] = []`, `shape: 'taper' | 'width' | 'area' = 'area'`, `showTable: boolean = true`, `dataTable: 'toggle' | 'visible' | 'none' = null`, `drop: 'relative' | 'absolute' | 'none' = 'relative'`, `skeletonCount: number`, `dimOthers: boolean = false`, `staggerMs: number = 60`, `tooltip: 'item' | 'none' = 'item'`
<!-- /inputs -->

#### `<ds-heatmap-chart>` — `HeatmapChartComponent`
A matrix of readings coloured by magnitude — depot by weekday, hour by date, queue by region.
Inputs: `columns: readonly string[]` (required in practice), `data: readonly HeatmapChartRow[]` (required), `min: number | null = null`, `max: number | null = null`, `showValues: boolean = false`, `interactive: boolean = false`, `dimOthers: boolean = false`, `tooltip: 'item' | 'none' = 'item'`, `caption: string | null = null`, `frame: 'auto' | 'none' = 'auto'`, `loading: boolean = false`, `error: boolean = false`, `emptyText: string = 'No data'`, `errorText: string = 'Could not load the data'`, `valueFormat: (value: number, location) => string`
Output: `(cellClicked): HeatmapChartCell`
Row: `HeatmapChartRow = { id?: string; label: string; data: readonly (number | null)[] }` — one reading per column, in the chart's own column order.
Cell: `HeatmapChartCell = { row, rowIndex, column, columnIndex, value }`
Not optional here: colour is the only channel carrying the quantity on the grid, so the scale under it and the annex table below it are always drawn — there is no `dataTable` input to turn the table off, because WCAG 1.4.1 is not satisfied by a grid of coloured squares. Every cell also names its own reading to assistive tech as `row, column: value`.
A `null` reading is a hole, not a low value: it draws as the surface, stays out of the colour scale, is inert under `interactive`, and never fires `cellClicked`. The ramp's coldest step is a real measurement, and painting "we never measured this" with it states a figure nobody recorded.
`min` / `max` only ever OPEN the scale further. Set both to compare two heat maps by colour — unset, each spans its own readings and the same hue means a different quantity on each.
Colour: the single-hue heat scale `--ds-chart-heat-1-color` … `--ds-chart-heat-8-color`, which spans the full lightness range and therefore runs 1.14:1 to 9.07:1 against white. It is NOT `--ds-chart-ramp-*`, which stays in the middle of the range for the funnel's stages. `showValues` draws the glyph in the cell's own colour inverted, which stays legible at either end without picking one ink for the whole scale.
The grid scrolls sideways below its natural width rather than crushing the cells, the same answer `ds-table` gives.
Scale marker: once the pointer has rested on a cell for `--ds-motion-chart-scale-marker-delay` (120ms, `0ms` under reduced motion), a marker over the scale names its reading and glides to its place on the ramp, so a sweep across the grid leaves it still; `showScaleMarker: false` drops it. The cells enter along the diagonals from the top-left, `staggerMs` apart, within 260ms.
Tokens: `--ds-heatmap-chart-cell-size`, `--ds-heatmap-chart-cell-gap`, `--ds-heatmap-chart-cell-radius`, `--ds-heatmap-chart-label-color`, `--ds-heatmap-chart-label-font-size`, `--ds-heatmap-chart-missing-color`, `--ds-heatmap-chart-focus-color`, `--ds-heatmap-chart-focus-width`.

<!-- inputs:ds-heatmap-chart -->
All inputs: `frame: 'auto' | 'none' = null`, `caption: string | null = null`, `summary: string | null = null`, `loading: boolean = false`, `error: boolean = false`, `emptyText: string | null = null`, `errorText: string | null = null`, `valueFormat: ChartValueFormat | null = null`, `interactive: boolean = false`, `tooltipSwatches: boolean | null = null`, `tooltipLingerMs: number | null = null`, `pinOnClick: boolean | null = null`, `columns: readonly string[] = []`, `data: readonly HeatmapChartRow[] = []`, `min: number | null = null`, `max: number | null = null`, `showValues: boolean = false`, `showScaleMarker: boolean = true`, `dimOthers: boolean = false`, `tooltip: 'item' | 'none' = 'item'`, `staggerMs: number = 40`
<!-- /inputs -->

#### `<ds-scatter-chart>` — `ScatterChartComponent`
Two continuous quantities against each other — weight against carriage cost, distance against time, volume against conversion. The other charts all put categories on one axis; this one does not.
Inputs: `data: readonly ScatterChartSeries[]` (required), `xLabel: string | null = null`, `yLabel: string | null = null`, `decimator: 'minMax' | 'lttb' | 'none' = 'minMax'`, `tickCount: number = 5`, `caption: string | null = null`, `summary: string | null = null`, `interactive: boolean = false`, `frame: 'auto' | 'none' = 'auto'`, `dataTable: 'none' | 'toggle' | 'visible' = 'none'`, `loading: boolean = false`, `error: boolean = false`, `emptyText: string = 'No data'`, `errorText: string = 'Could not load the data'`, `valueFormat: (value: number, location) => string`
Output: `(pointClicked): ScatterChartReading`
Series: `ScatterChartSeries = { id: string; label: string; data: readonly { x: number; y: number }[]; color?: string }`
`xLabel` / `yLabel` are not decoration: without them the reader has two numbers and no idea which is which, and on a scatter that is the whole reading.
It thins its own data, and it says so. SVG degrades by the number of NODES, not readings — the same data as a line is one `<path>`, as a scatter it is one node per point, and Lighthouse warns at ~800 nodes and errors at ~1400 on a page that may hold four more charts. Past FOUR times the plot's width in marks the series is decimated, a line under the plot says how many readings were thinned, and the annex table still lists every one.
`decimator`: `'minMax'` is the default because it is the only one that promises anything — each bucket's highest and lowest reading survive by construction, so the spike a reader is looking for cannot be the point that was dropped, and a bucket's answer does not depend on its neighbours. `'lttb'` draws a truer silhouette at the same budget with no such promise. `'none'` is the caller taking the node budget on themselves.
The annex table is built when it is OPENED: `<details>` keeps its children in the DOM while shut, so 12 000 readings parked 48 000 nodes on the page - three times what decimating the plot had just saved. Closed the chart is 615 nodes; opened, every reading is there.
Hover answers with the point nearest the pointer anywhere over the plot: a ring glides to it and a dashed tether runs from the pointer to it. `nearestRadius: number | null = null` caps that reach in CSS pixels from a point's centre, inclusive. `showNearestPoint: false` answers only within 16px of a point's centre, without the ring and tether. Points enter left to right within 260ms (`staggerMs`).
Marks are semi-transparent by default, because the interesting thing is where they pile up: at full opacity a cluster of forty and a cluster of four are the same solid disc.
The budget is a gate, not a paragraph: the decimator is fed 100 000 readings and the output is asserted to fit the plot, with a control that the same data undecimated does not.
Tokens: `--ds-scatter-chart-grid-line-color`, `--ds-scatter-chart-axis-line-color`, `--ds-scatter-chart-axis-label-color`, `--ds-scatter-chart-axis-font-size`, `--ds-scatter-chart-dot-radius`, `--ds-scatter-chart-dot-opacity`, `--ds-scatter-chart-focus-color`, `--ds-scatter-chart-focus-width`.

<!-- inputs:ds-scatter-chart -->
All inputs: `frame: 'auto' | 'none' = null`, `caption: string | null = null`, `summary: string | null = null`, `loading: boolean = false`, `error: boolean = false`, `emptyText: string | null = null`, `errorText: string | null = null`, `valueFormat: ChartValueFormat | null = null`, `interactive: boolean = false`, `tooltipSwatches: boolean | null = null`, `tooltipLingerMs: number | null = null`, `pinOnClick: boolean | null = null`, `data: readonly ScatterChartSeries[] = []`, `xLabel: string | null = null`, `yLabel: string | null = null`, `decimator: 'minMax' | 'lttb' | 'none' = 'minMax'`, `tickCount: number = 5`, `dataTable: 'toggle' | 'visible' | 'none' = null`, `tooltip: 'item' | 'none' = 'item'`, `dimOthers: boolean = false`, `showNearestPoint: boolean = true`, `nearestRadius: number | null = null`, `staggerMs: number = 40`
<!-- /inputs -->

#### `<ds-waterfall-chart>` — `WaterfallChartComponent`
A running total, bar by bar: what a figure started at, what moved it, and what it ended at.
Inputs: `data: readonly WaterfallChartBar[]` (required), `showValues: boolean = true`, `showConnectors: boolean = true`, `caption: string | null = null`, `summary: string | null = null`, `tickCount: number = 5`, `interactive: boolean = false`, `frame: 'auto' | 'none' = 'auto'`, `dataTable: 'none' | 'toggle' | 'visible' = 'none'`, `loading: boolean = false`, `error: boolean = false`, `emptyText: string = 'No data'`, `errorText: string = 'Could not load the data'`, `valueFormat: (value: number, location) => string`
Output: `(barClicked): WaterfallChartBar`
Bar: `WaterfallChartBar = { id?: string; label: string; value: number; kind?: 'delta' | 'total' | 'subtotal' }`
Every row adds its `value` to the running sum wherever it sits. A `'delta'` (the default) hangs from the level the bar before it left off at; a `'total'` or `'subtotal'` stands on zero at the sum reached, which makes it a figure in its own right rather than a change. A closing total usually carries `value: 0` — it prints the sum, not a change. A subtotal differs from a total only in that the chain carries on past it.
Order is never sorted: the sequence is the meaning.
Colour never carries the meaning alone. Each bar prints its own sign above it (`+130`, `-320`, and a total's plain sum), and each bar's accessible name says "increase", "decrease" or "total" in words, so the chart survives forced colours, a monochrome print and a reader who cannot tell the two hues apart.
Colour: `--ds-chart-positive-color` and `--ds-chart-negative-color`, NOT `--success` / `--error` — a waterfall's up and down are not success and failure, and a cost rising is a rise and a bad one. They point at the palette's two lead hues. A total takes `--ds-chart-series-default-color`, because it is not a change at all.
`showConnectors` draws the dashed rule chaining one bar to the next at the level they share; without it the bars read as separate columns rather than as one running total.
Built on `<ds-chart>` with a column series and a waterfall-specific mark projected into it, so the axis, the gridlines, the frame and the annex table are the family's own. A chain that falls past zero opens the axis downwards rather than clipping.
Tokens: `--ds-waterfall-chart-connector-color`.

<!-- inputs:ds-waterfall-chart -->
All inputs: `frame: 'auto' | 'none' = null`, `caption: string | null = null`, `summary: string | null = null`, `loading: boolean = false`, `error: boolean = false`, `emptyText: string | null = null`, `errorText: string | null = null`, `valueFormat: ChartValueFormat | null = null`, `interactive: boolean = false`, `tooltipSwatches: boolean | null = null`, `tooltipLingerMs: number | null = null`, `pinOnClick: boolean | null = null`, `data: readonly WaterfallChartBar[] = []`, `showValues: boolean = true`, `showConnectors: boolean = true`, `dimOthers: boolean = false`, `showAxisReadout: boolean = true`, `tooltip: 'item' | 'none' = 'item'`, `tickCount: number = 5`, `skeletonCount: number`, `dataTable: 'toggle' | 'visible' | 'none' = null`, `staggerMs: number = 40`
<!-- /inputs -->

#### `<ds-line-chart>` — `LineChartComponent`
One or more series plotted over a shared set of categories.
Inputs: `categories: readonly string[]` (required), `series: readonly LineChartSeries[]` (required), `yAxisMode: 'aligned' | 'exact' | 'dual-grid' | 'split' = 'aligned'`, `curve: 'linear' | 'step' | 'smooth' = 'linear'`, `stack: 'none' | 'stacked' | 'normalized' = 'none'`, `showMarkers: boolean = true`, `gaps: 'break' | 'zero' = 'break'`, `tickCount: number = 5`, `caption: string | null = null`, `summary: string | null = null`, `dataTable: 'none' | 'toggle' | 'visible' = 'none'`, `loading: boolean = false`, `emptyText: string = 'No data'`, `error: boolean = false`, `errorText: string = 'Could not load the data'`, `valueFormat: (value: number) => string`, `interactive: boolean = false`, `tooltip: 'item' | 'axis' | 'none' = 'axis'`, `patterns: boolean = false`, `staggerMs: number = 40`, `legendFilters: boolean = false`, `hiddenSeries: readonly string[] = []` (two-way), `rescaleOnHide: boolean = true`, `noVisibleSeriesText: string | null = null` (unset: `DS_INTL.chart.noVisibleSeries`)
Output: `(pointClicked): LineChartReading` — the reading that was clicked or activated. Fires whether or not `interactive` is set.
Interaction: a pointer moving over the plot picks the CATEGORY under it — a band paints behind every series and `tooltip="axis"`, the default here, names every series at that category. With `interactive` set, Tab reaches the category band; Left and Right walk the categories, Up and Down focus one series' marker, whose tooltip names that point alone, and Enter on it fires `pointClicked`. A tap picks a category and latches the panel until the next tap outside; markers carry a transparent hit stroke of 24px, or 44px under `(pointer: coarse)`. `dimOthers` is the same separate opt-in as on the other four, and here it is the legend hover that drives it.
Legend: drawn whenever there is more than one series. `legendFilters` turns each entry into a checkbox that hides its series, `hiddenSeries` is two-way so a page can drive it from a URL parameter, and hovering or focusing an entry tints it, dims the others and thickens the one hovered. Hiding a series re-scales the value axis to what is left; `rescaleOnHide: false` holds it where it stands with every series shown, for a period-over-period comparison the reader should not see re-drawn. `ds-column-chart` and `ds-chart` take the same input with the same default. Hiding every series replaces the plot with `noVisibleSeriesText` on a `role="status"` line, legend still rendered.
Second channel: `patterns` gives every series a dash of its own, in palette-slot order, with slot 1 left solid. Off by default — the shipped palette clears the colour-blind separation threshold on its own, so this is for monochrome print, a retuned palette, or a reader who asks for it.
Series: `LineChartSeries = { id: string; label: string; data: readonly (number | null)[]; axis?: 'primary' | 'secondary'; area?: boolean; slot?: number }`. A `null` is a missing reading and `gaps` decides what it draws — `'break'` leaves a hole in the line, `'zero'` plants a point on the baseline. `area` fills the band between the line and its axis baseline. `slot` pins a palette slot, so hiding one series leaves every other series' colour alone.
`yAxisMode` only matters once a series sets `axis: 'secondary'`, and every name says what is done to the GRIDLINES: `'aligned'` shares one set and rounds the secondary step up, so that series stops short of the top; `'exact'` shares the gridlines but ends the secondary axis on its largest reading, so it uses the full height and its labels are not round; `'dual-grid'` scales and grids each axis on its own; `'split'` draws two plots one above the other, sharing the category axis. `curve` decides what is drawn BETWEEN two readings: `'linear'` asserts nothing, `'step'` holds each reading to the next, `'smooth'` is a monotone cubic that draws no peak the data lacks. `stack` decides how several series share the axis: `'stacked'` starts each where the one below it ended, `'normalized'` divides by the category's own total so the axis reads in shares. Only a series with `area: true` fills, and stacking runs per axis.
Colour: series ARE different things, so the categorical palette applies — `--ds-chart-series-1-color` onward, by position or by `slot`.
`annotations: LineChartAnnotation[]` pins a label over one reading — `{ categoryIndex, label, seriesId? }`, the series defaulting to the first plotted one — so a peak reads in a screenshot with no pointer. Placed above the reading, below it where the plot has no room, and anchored to its own edge within 48 view units of one. An annotation whose series is hidden or whose reading is `null` draws nothing. Marked `aria-hidden`: the annex table already carries every reading, so announcing it again reads the number twice.
Tokens: `--ds-line-chart-plot-height`, `--ds-line-chart-line-width`, `--ds-line-chart-dot-radius`, `--ds-line-chart-area-opacity`, `--ds-line-chart-swatch-size`, `--ds-line-chart-grid-line-color`, `--ds-line-chart-axis-line-color`, `--ds-line-chart-axis-label-color`, `--ds-line-chart-axis-font-size`, `--ds-line-chart-annotation-color`, `--ds-line-chart-annotation-font-size`, `--ds-line-chart-annotation-font-weight`, `--ds-line-chart-annotation-halo-color`, `--ds-line-chart-annotation-halo-width`.

<!-- inputs:ds-line-chart -->
All inputs: `frame: 'auto' | 'none' = null`, `caption: string | null = null`, `summary: string | null = null`, `loading: boolean = false`, `error: boolean = false`, `emptyText: string | null = null`, `errorText: string | null = null`, `valueFormat: ChartValueFormat | null = null`, `interactive: boolean = false`, `tooltipSwatches: boolean | null = null`, `tooltipLingerMs: number | null = null`, `pinOnClick: boolean | null = null`, `categories: readonly string[] = []`, `series: readonly LineChartSeries[] = []`, `yAxisMode: 'aligned' | 'exact' | 'dual-grid' | 'split' = 'aligned'`, `showMarkers: boolean = true`, `outline: boolean = true`, `annotations: readonly LineChartAnnotation[] = []`, `dimOthers: boolean = false`, `gaps: 'break' | 'zero' = 'break'`, `curve: 'linear' | 'step' | 'smooth' = 'linear'`, `stack: 'none' | 'stacked' | 'normalized' = 'none'`, `yAxisLabel: string | null = null`, `secondaryAxisLabel: string | null = null`, `tickCount: number = 5`, `dataTable: 'toggle' | 'visible' | 'none' = null`, `max: number | null = null`, `maxSecondary: number | null = null`, `hiddenSeries: readonly string[] = []`, `rescaleOnHide: boolean = true`, `legendFilters: boolean = false`, `legendMode: 'toggle' | 'isolate' = 'isolate'`, `noVisibleSeriesText: string | null = null`, `patterns: boolean = false`, `selectRange: boolean = false`, `showAxisReadout: boolean = true`, `showChange: boolean = false`, `staggerMs: number = 40`, `tooltip: 'item' | 'axis' | 'none' = 'axis'`, `tooltipAnchor: 'reading' | 'pointer' = 'reading'`
<!-- /inputs -->

#### Chart defaults — what `DS_CONFIG` decides once
Five chart inputs resolve through `DS_CONFIG.chart` because they are one decision per APP, not per plot: `valueFormat` (a number reads one way in a product; a formatter passed per chart drifts as soon as there are two screens), `dataTable` (whether the numbers behind a plot have a non-visual route is an accessibility policy), `frame`, `tooltipLingerMs` and `pinOnClick` (default `true`: a click holds a mark, with a pin disc on it, until a second click, Escape or a press elsewhere). `DS_CONFIG.chart.hoverDelayMs` (default `0`) is how long a resting pointer waits before any chart answers it; once a chart has answered, the next mark answers at once until the pointer leaves it, and focus, a tap and a pinning click answer at once. Precedence is the input, then the config, then the built-in — so binding one on a single chart still wins. The empty and error copy is wording, so it lives in `DS_INTL.chart.empty` / `.error`; the number locale is `DsConfig.locale`.

`DS_CONFIG.chart.rendering` decides how charts build on a long page and is off by default: every chart draws as soon as it is created. With `deferUntilVisible: true` each chart shows a still placeholder of its own shape until it comes within `visibleMargin` (default `'10% 0px'`) of the viewport; `buildAheadWhileIdle` (default `true`) builds the charts within `buildAheadMargin` (default `'100% 0px'`) while the page is idle; `frameBudgetMs` (default `8`) caps how long one task spends building; `skipWhileOffscreen` (default `true`) lets the browser skip a built chart's rendering off screen through `content-visibility: auto`. Until a deferred chart is built a screen reader meets its caption only.

```ts
providers: [provideDsConfig({ chart: { valueFormat: v => v.toLocaleString('de-DE'), dataTable: 'visible' } })]
```

Everything else stays per chart: `interactive`, `tooltip`, `staggerMs`, `legend`, `tickCount` and the geometry inputs each answer a question about one plot.

#### Chart frame — the box a chart draws around itself
Every chart paints its own border, radius, padding and `--surface-default` background, on by default. That is unusual here — most components resist owning chrome — and a chart earns the exception because it is read as an OBJECT: a plot with axes, a legend and an annex table, whose parts run into the page without an edge. A chart that already sits inside a card drops the frame with two declarations rather than a mode flag:

```scss
ds-bar-chart { --ds-chart-frame-border-width: 0; --ds-chart-frame-padding: 0; }
```

Tokens: `--ds-chart-frame-border-color`, `--ds-chart-frame-border-width`, `--ds-chart-frame-radius`, `--ds-chart-frame-padding`, `--ds-chart-frame-bg-color`.

#### Chart colour — which palette a chart takes
Three families, and reaching for the wrong one is the usual chart bug. Set the `--ds-chart-*` contract tokens, never the `--chart-categorical-*` / `--chart-ramp-*` palette behind them.
- **Categorical** — `--ds-chart-series-1-color` … `--ds-chart-series-8-color`, for marks that are DIFFERENT THINGS: pie slices, line series. Eight hues, each clearing 3:1 on white for WCAG 1.4.11 and at least dE 15 from every other under normal, deuteranope and protanope vision. No hue between 35 and 130: a yellow or a lime cannot be both rich and 3:1 on white, and forcing one past the floor turns it to mustard. Slots 7 and 8 are the "rest" / "other" buckets, and slot 8 is a neutral on purpose — every eighth HUE that clears the floor lands within dE 4 of one of the other seven under some colour-vision deficiency.
- **Single series** — `--ds-chart-series-default-color` plus `--ds-chart-series-accent-color`, for marks that are ONE thing measured repeatedly: bar rows, columns. One colour for all of them, and the accent on the one the reader should land on.
- **Ramp** — `--ds-chart-ramp-1-color` … `--ds-chart-ramp-8-color`, one hue light to deep, for the ORDERED stages of a single quantity: the funnel.

#### `<ds-chart-data-table>` — `ChartDataTableComponent`
The annex table under a chart: every reading in a `<details>` a reader can open. Cells arrive already formatted, because how a value reads is the chart's decision, not the table's. `rowHeader` renders each row's first cell as a `<th scope="row">`, for a matrix whose rows are named rather than numbered; `toggled` fires when the disclosure changes, for a chart that builds its rows only when they are asked for.

<!-- inputs:ds-chart-data-table -->
All inputs: `columns: readonly string[] = []`, `rows: readonly ChartDataRow[] = []`, `caption: string | null = null`, `open: boolean = false`, `rowHeader: boolean = false`
<!-- /inputs -->

#### `<ds-chart>` — `ChartComponent`

<!-- inputs:ds-chart -->
All inputs: `frame: 'auto' | 'none' = null`, `caption: string | null = null`, `summary: string | null = null`, `loading: boolean = false`, `error: boolean = false`, `emptyText: string | null = null`, `errorText: string | null = null`, `valueFormat: ChartValueFormat | null = null`, `interactive: boolean = false`, `tooltipSwatches: boolean | null = null`, `tooltipLingerMs: number | null = null`, `pinOnClick: boolean | null = null`, `categories: readonly string[] = []`, `skeletonCount: number`, `tickCount: number = 5`, `min: number | null = null`, `max: number | null = null`, `cursor: 'none' | 'category' | 'auto' = 'auto'`, `rescaleOnHide: boolean = true`, `maxSecondary: number | null = null`, `plotHeight: number = 240`, `axisGutter: number = 46`, `valueSpace: number = 20`, `secondaryAxisMode: 'aligned' | 'exact' | 'dual-grid' | 'split' = 'aligned'`, `axisColor: string | null = null`, `secondaryAxisColor: string | null = null`, `axisLabel: string | null = null`, `secondaryAxisLabel: string | null = null`, `selectRange: boolean = false`, `showAxisReadout: boolean = true`, `tooltipTemplate: TemplateRef<{
    $implicit: ChartTooltipContext;
  }> | null = null`, `tooltipExtraGap: number = 0`
<!-- /inputs -->

#### `<g[dsColumnSeries]>` — `ColumnSeriesComponent`

<!-- inputs:g[dsColumnSeries] -->
All inputs: `data: readonly ColumnSeriesPoint[] = []`, `showValues: boolean = true`, `interactive: boolean = false`, `pinOnClick: boolean | null = null`, `dimOthers: boolean = false`, `staggerMs: number = 40`, `partOfWhole: boolean = false`, `tooltip: 'item' | 'none' = 'item'`, `tooltipAnchor: 'mark' | 'cell' = 'mark'`, `tooltipLingerMs: number`, `valueFormat: ChartValueFormat`, `columnWidthRatio: number = 0.8`, `slot: number = 0`, `slotCount: number = 1`, `offsets: readonly ChartStackOffset[] | null = null`, `soleSeries: boolean = false`, `axis: 'primary' | 'secondary' = 'primary'`, `seriesColor: string | null = null`, `seriesFill: 'solid' | 'hatched' = null`, `seriesLabel: string | null = null`, `seriesKey: string | null = null`, `highlighted: string | null = null`, `hidden: boolean = false`, `runningTotal: boolean = false`
<!-- /inputs -->

#### `<g[dsLineSeries]>` — `LineSeriesComponent`

<!-- inputs:g[dsLineSeries] -->
All inputs: `data: readonly LineSeriesData[] = []`, `showMarkers: boolean = true`, `outline: boolean = true`, `interactive: boolean = false`, `pinOnClick: boolean | null = null`, `dimOthers: boolean = false`, `highlighted: string | null = null`, `showChange: boolean = false`, `patterns: readonly string[] = []`, `stacked: boolean = false`, `staggerMs: number = 40`, `gaps: 'break' | 'zero' = 'break'`, `curve: 'linear' | 'step' | 'smooth' = 'linear'`, `tooltip: 'item' | 'axis' | 'none' = 'item'`, `tooltipAnchor: 'reading' | 'pointer' = 'reading'`, `tooltipLingerMs: number`, `valueFormat: ChartValueFormat`
<!-- /inputs -->

#### `<g[dsSeriesAnnotation]>` — `SeriesAnnotationComponent`
A label pinned to one reading, legible with no pointer. Takes the readings rather than finding them: a mark never sees the other marks, so the caller that owns the series is the one that knows which value a label belongs to. Reports no domain.

<!-- inputs:g[dsSeriesAnnotation] -->
All inputs: `annotations: readonly ChartAnnotation[] = []`
<!-- /inputs -->

#### `<g[dsReferenceLabel]>` — `ReferenceLabelComponent`

<!-- inputs:g[dsReferenceLabel] -->
All inputs: `thresholds: readonly ChartThreshold[] = []`
<!-- /inputs -->

#### `<g[dsReferenceLine]>` — `ReferenceLineComponent`

<!-- inputs:g[dsReferenceLine] -->
All inputs: `thresholds: readonly ChartThreshold[] = []`
<!-- /inputs -->

### Domain

#### `<ds-w3w>` — `W3wComponent`
What3Words address chip — branded display for `///word.word.word` addresses; click-to-copy.
Inputs: `address: required string`, `prefix: string = '///'`, `copyable: boolean = true`
Output: `(copied): string` — emits the raw `address` value after a copy attempt

---

## Icons

Icon component: `<ds-icon [name]="iconName" [size]="16" [stroke]="1.75">`. `IconName` is `keyof typeof ICONS | string` — built-in DS names autocomplete; consumer-registered names (see `provideDsIcons` below) accept any string at the cost of autocomplete.

All built-in icons (kebab-case where indicated, camelCase otherwise — DS uses both):

`search` `plus` `minus` `check` `x` `chevronDown` `chevronRight` `chevronLeft` `chevronUp` `arrowRight` `arrowUp` `arrowDown` `info` `warn` `error` `success` `bell` `settings` `user` `users` `home` `calendar` `truck` `box` `map` `activity` `folder` `edit` `external` `trash` `copy` `download` `upload` `eye` `filter` `sort` `sortAsc` `sortDesc` `grid` `list` `moreH` `moreV` `link` `flag` `star` `inbox` `archive` `clock` `refresh` `play` `pause` `cmd` `paperclip` `file` `image` `lock` `logout` `help` `pin` `bookmark` `sparkle` `layers` `chart` `gauge` `package` `git` `sun` `moon` `save` `rotate` `qr` `globe` `phone` `bin` `pen` `smile` `frown` `mail` `eye-off` `check-circle` `drag`

Icons render inside `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">`. For consumer-side icons without forking DS, use `provideDsIcons(…)` below.

<!-- inputs:ds-w3w -->
All inputs: `prefix: string = '///'`, `address: required string`, `copyable: boolean = true`
<!-- /inputs -->

#### `DS_ICON_REGISTRY` / `provideDsIcons(icons)`

Consumer apps can register additional icons without forking DS. Each entry maps a name to the raw SVG body — everything that goes *inside* `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">`. Typically one or more `<path>` / `<circle>` / `<rect>` elements with no `stroke`/`fill` of their own (the host SVG paints them).

```ts
import { provideDsIcons } from '@ids-group-ltd/ids-design-system';

bootstrapApplication(AppComponent, {
  providers: [
    provideDsIcons({
      'cloud-upload': '<path d="M7 18a5 5 0 1 1 .9-9.9 …"/><path d="M12 21V11"/>',
      shield:         '<path d="M12 3 4 6v6c0 5 …"/>',
    }),
  ],
});
```

Lookup order: built-in `ICONS` first, then the consumer registry. Names that collide with built-ins are ignored — fork the DS source if you need to override a built-in.

---

## App config

#### `DS_CONFIG` / `provideDsConfig(config)`

Inject `DS_CONFIG` token (default factory returns `{}`) to set library-wide defaults that consumer-level component inputs can still override.

```ts
import { provideDsConfig } from '@ids-group-ltd/ids-design-system';

bootstrapApplication(AppComponent, {
  providers: [
    provideDsConfig({
      breadcrumbs: { separator: 'chevronRight', clickable: true },
    }),
  ],
});
```

`DsConfig` shape (the exported `DsConfig` type is the full contract):

Eighteen sections and one top-level `locale`. The exported `DsConfig` type is the source of truth — each key carries its own
doc comment there, including why it is an app-level decision at all.

```ts
interface DsConfig {
  locale?: string;                         // BCP-47; default LOCALE_ID
  field?: {
    reserveMessage?: boolean;              // keep a message line of space when empty
    errorMessages?: Record<string, string>; // fallback text per validation-error kind
    stateIcons?: false | {                 // the message line's leading glyph, per state
      error?: IconName | false;            // default: `error`
      warning?: IconName | false;          // default: `warn`
      success?: IconName | false;          // default: `success`
      hint?: IconName | false;             // default: NONE — hint is not a state
    };
  };
  control?: { size?: DsSize };             // every control on the field-height contract
  pagination?: { size?: DsSize; layout?: PaginationLayout }; // every pager, ds-table's footer included
  card?: { elevation?: CardElevation; padding?: CardPadding };
  table?: { stickyScrollbar?: boolean; bordered?: boolean };
  modal?: { dividers?: boolean };          // reaches a ModalService confirm, which has no host to bind
  icon?: { size?: number };
  badge?: { withDot?: boolean };
  breadcrumbs?: { separator?: IconName; clickable?: boolean };
  datePicker?: { locale?: string; dateFormat?: string; firstDayOfWeek?: number };
  timePicker?: { format?: '24h' | '12h' };
  avatar?: { initials?: (name: string) => string };
  brand?: { name?: string; logoLetter?: string; tagline?: string };
}
```

Precedence is always: **explicit input → config → component default.** A component publishes what it
resolved as a public readback (`sizeResolved()`, `dividersResolved()`, …) so a host can read the
effective value rather than re-deriving the chain.

**Call `provideDsConfig` once per injector.** Two calls in the same `providers` array do NOT merge —
both resolve their parent with `skipSelf`, so the later wins and the earlier is silently lost. Merging
happens across injector LEVELS: a route or component inherits the app's config and overrides only the
keys it names.

#### `DS_INTL` / `provideDsIntl(overrides)`

`DS_INTL` holds every string the library renders itself: picker rows and chips, clear and dismiss
buttons, pager and table announcements, chart descriptions and annex headers. It is a `Signal<DsIntl>`
holding the English defaults (`DS_INTL_DEFAULTS`) until an app provides its own.

```ts
import { LOCALE_ID } from '@angular/core';
import { provideDsIntl } from '@ids-group-ltd/ids-design-system';

providers: [
  { provide: LOCALE_ID, useValue: 'ru' },
  provideDsIntl({ picker: { selectAll: 'Выбрать все', clearSelection: 'Очистить выбор' } }),
]
```

- **Object or factory.** An object is one fixed language. A factory returning a signal switches
  language at runtime, and runs in an injection context, so it can inject the app's own language
  service:
  `provideDsIntl(() => { const i18n = inject(I18n); return computed(() => i18n.dictionary().ds); })`.
- **Section-wise merge across levels.** A route or component `provideDsIntl` inherits the one above
  it and overrides only the keys it names. Like `provideDsConfig`, call it once per injector.
- **Precedence: input → `DS_INTL`.** A text input on the element (`placeholder`, `moreLabel`,
  `sortAnnouncement`, …) still wins; those inputs default to `null` and publish a `…Resolved`
  readback holding the effective text.
- **Numbers and dates are not words.** They follow `DsConfig.locale`, then `LOCALE_ID`: chart values
  and percentages, `ds-date-picker`, `ds-dropzone` file sizes. An app that localizes sets both, once,
  at the root.

---

## Services

#### `BreadcrumbsService`

`@Injectable({ providedIn: 'root' })`. Signal-based state primitive — apps push crumbs, `<ds-breadcrumbs>` reads from here when its `[items]` input is omitted.

```ts
private readonly crumbs = inject(BreadcrumbsService);
// signal-readable items
this.crumbs.items()      // -> BreadcrumbItem[]
// mutators
this.crumbs.set([{ label: 'Overview', href: '/workspaces' }, { label: 'Detail' }]);
this.crumbs.push({ label: 'Extra' });
this.crumbs.replaceLast({ label: 'Renamed' });
this.crumbs.pop();
this.crumbs.clear();
```

**Two ways to feed it:**

1. **Programmatic** — each page calls `this.crumbs.set(...)` (e.g. inside `effect(() => …)` when the page model resolves). Use when crumb labels depend on data the page already has loaded (a program name, a campaign title).

2. **Route-driven** — annotate routes with `data.breadcrumb` and run a Router→Service bridge once at app bootstrap. `breadcrumb` accepts:
   - `string` → `{ label: string, href: <built-from-url> }`
   - `BreadcrumbItem`
   - `BreadcrumbItem[]`
   - `(snap: ActivatedRouteSnapshot) => string | BreadcrumbItem | BreadcrumbItem[]`

   Mix-and-match: route bridge sets a base trail, page effect overrides with a richer version when its data is ready.

#### `ToastService`
`@Injectable({ providedIn: 'root' })`. Inject and call:
- `show(opts: ToastOptions): ToastRef` — `{ title?, body, variant?: 'info' | 'success' | 'warning' | 'error' | 'loading', dismissible?, icon?, action?: ToastAction, durationMs? = 5000 }`. Returns `{ id, dismiss() }`. `durationMs: 0` (and any negative) means it never auto-dismisses, and it is counted from the moment the toast becomes VISIBLE, not from the call — a toast queued behind `maxVisible` keeps its full time on screen. A `loading` toast is forced to 0 and discards a supplied `durationMs`.
- `promise<T>(source: Promise<T>, messages: ToastPromiseMessages): Promise<T>` — shows a `loading` toast, then patches it in place to `success` or `error` when `source` settles. Returns `source` itself, so an un-`catch`ed call still produces an unhandled rejection. The settled toast dismisses after a hard-coded 4s (success) or 6s (error), counted from the moment it becomes visible and not overridable; `dismissAll()` cancels it like any other.
- `dismissAll(): void`

Defaults come from `provideDsConfig({ toast: … })`:
- `maxVisible?: number` — cap on concurrently visible toasts. Default `5`; `0` means unlimited. Extras queue and appear as earlier ones dismiss.
- `position?: { horizontalPosition?: 'left' | 'center' | 'right', verticalPosition?: 'top' | 'bottom', offset?: string }` — merged field by field over `right` / `top` / `var(--space-6)`, so naming one key keeps the other two.
- `mirrorDevWarnings?: boolean` — in dev mode, every library warning that reaches the console also shows as a `warning` toast titled "Dev warning" for 10s, once per message, from the moment the app first injects `ToastService` (warnings raised before that show then, up to 50). Default `true`; never in a production build, and an app that never injects `ToastService` gets the console only.

The `toast` section resolves **once, at the root injector**, when the service is first used — unlike every other section, which a `Route` or a component can narrow. `ToastService` is `providedIn: 'root'`, so a route-level `provideDsConfig` never reaches it, and the position cannot change after the first `show()`.

On first `show()` the service lazily creates a CDK overlay and mounts a `<ds-toast-region>` into it. **Do not place `<ds-toast-region>` yourself** — the service only ever talks to the instance it created, so a hand-placed one is an invisible empty box that never receives a toast, with no warning. It appears in the generated API table only because the extractor lists every exported component.

#### `BodyScrollLockService`

`@Injectable({ providedIn: 'root' })`. Ref-counted lock on `document.body` scroll, shared by every overlay that covers the viewport — `ds-modal`, `ds-drawer`, `ds-bottom-sheet` all take one. Exported since 0.7.0 so a consumer's own full-screen overlay can participate in the same lock instead of fighting it.
- `lock(): void` — the FIRST call saves the current `body` overflow and hides it.
- `unlock(): void` — only the LAST one restores it, so closing one overlay cannot re-enable page scroll under another still open above it.

Calls must be paired: one `unlock()` per `lock()`. An unmatched `unlock()` is a no-op rather than an error, so a leaked `lock()` leaves the page unscrollable with nothing to show why.

---

## Migration tips

- **Don't add `class="card"` on `<ds-card>`.** Some consumer apps carry a legacy global `.card` rule that adds a second border on top of the component's own — use `ds-card` as-is, override tokens via `ds-card { --ds-card-...: ... }`, or pass a domain class like `class="kpi"`.
- **`@use 'tokens'` alone won't give you `.link` / `.t-*` / `.grid-*`.** Pull those partials explicitly or `@use 'styles/ds'` for the full aggregate. See Foundations → Global helper classes.
- **`<ng-content>` default slot is allowed once per template.** If you duplicate it across `@if/@else` branches Angular silently drops projected children. Hoist a single default slot and toggle visibility via a class.
- **Tokens on `:host`, not on the inner root class.** Defaults declared inside `.card { --ds-card-...: … }` block external overrides because the inner specificity wins. Move them to `:host` so consumer `ds-card { --ds-card-...: ... }` cascades through.
- **Brand overrides Tier 1 palette + a few Tier 2 roles.** Don't add brand-specific values inside individual components; put them in a consumer-side `_brand-*.scss` scoped to `[data-brand="…"]` — the DS itself stays brand-agnostic.
