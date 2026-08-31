# Badge & status-dot statuses

How status colours work for `ds-badge` and `ds-status-dot`, and how to migrate to the
consumer-defined status system introduced in **0.5.1**.

> TL;DR — the DS ships **no** predefined statuses. You declare your own status vocabulary once
> (SCSS + an optional TS registry), then set `[status]` on the component. Colour comes from
> `[data-status]`, never from a status-named CSS class.

## The model

There are three moving parts:

1. **The input.** `ds-badge` / `ds-status-dot` take `[status]` (typed `DsStatusKey`). The component
   reflects the value onto the host as a `data-status` attribute — it does **not** add a
   status-named CSS class, and it has no built-in colour for any value.

   ```html
   <ds-badge [status]="'in-transit'">In transit</ds-badge>
   <!-- renders: <ds-badge data-status="in-transit" class="...">…</ds-badge> -->
   ```

   Unset `[status]` → no `data-status` → the neutral default (`--surface-secondary` /
   `--text-secondary`).

2. **The colour wiring (SCSS).** `styles/status` turns a Sass map of status keys into
   `[data-status='…']` rules that set the public component tokens:

   ```scss
   @use '@ids-group-ltd/ids-design-system/styles/status' as status;

   @include status.define(
     (
       'in-transit': (
         bg: var(--warning-subtitle),
         text: var(--warning-text),
         dot: var(--warning),
       ),
       'delivered': (
         bg: var(--success-subtitle),
         text: var(--success-text),
       ),
     )
   );
   ```

   Each generated rule looks like:

   ```css
   ds-badge[data-status='in-transit'] {
     --ds-badge-bg-color: …;
     --ds-badge-label-color: …;
   }
   ds-status-dot[data-status='in-transit'] {
     --ds-status-dot-color: …;
   }
   ```

   **Map entry shape** — `(bg:, text?:, dot?:)`:
   | key | required | drives |
   |--------|----------|---------------------------------------------------|
   | `bg` | yes | `--ds-badge-bg-color` (badge fill) |
   | `text` | no | `--ds-badge-label-color` (badge label); unset → component `--text-secondary` fallback |
   | `dot` | no | `--ds-status-dot-color`; unset → falls back to `text` |

   Prefer palette/role tokens (`var(--success-subtitle)`) over raw hex so a theme swap propagates.

3. **The type (TS, optional but recommended).** `DsStatusKey` is an open `string` until you augment
   `DsStatusRegistry` via declaration merging — then it narrows to the union of your keys, giving
   autocomplete and compile-time safety on `[status]`:

   ```ts
   // e.g. src/app/core/ds-status-registry.d.ts
   import '@ids-group-ltd/ids-design-system';

   declare module '@ids-group-ltd/ids-design-system' {
     interface DsStatusRegistry {
       'in-transit': true;
       delivered: true;
     }
   }
   ```

   Register every key you pass to `[status]`. If some `[status]` bindings are typed `string`
   (generic pass-through components), either tighten those inputs to your status union or leave the
   registry unaugmented (open `string` is a fully supported mode — you just lose autocomplete).

### `semantic-preset`

If you only need the four canonical semantics plus neutral, skip the custom map and include the
preset mixin directly:

```scss
@include status.semantic-preset; // wires info / success / warning / error / neutral
```

`semantic-preset` is a ready-made `define(...)` call wiring `info` / `success` / `warning` /
`error` / `neutral` to the DS semantic token families. Mix it with your own `define(...)` for
domain keys the presets don't cover.

## Recommended file layout

Keep the wiring in one place, separate from ad-hoc component overrides:

```
src/styles/_badge-status.scss     // @use 'styles/status' + a single @include status.define(...)
src/app/core/ds-status-registry.d.ts  // DsStatusRegistry augmentation (same key list)
```

Then `@use './styles/badge-status';` from your global stylesheet. The SCSS map and the TS registry
are two views of the **same** key list — keep them in sync.

## Migrating from pre-0.5.1 (the factory-status era)

Before 0.5.1 the DS shipped factory statuses: `ds-badge[variant]` (`BadgeVariant`) rendered a
status-named CSS class (`.badge.completed`, `.badge.error`, …) coloured by factory
`--status-*` lifecycle tokens. **All of that is gone.** Full migration, per usage:

**1. Rename the input on every `ds-badge` / `ds-status-dot`.**

```text
before                        after
<ds-badge variant="active">   <ds-badge status="active">
<ds-badge [variant]="s()">    <ds-badge [status]="s()">
```

Static `variant="…"` on a badge is a **silent** failure after the rename — Angular ignores the
unknown attribute rather than erroring, so grep for `variant=` on `ds-badge` specifically.
(`ds-progress` etc. keep their own `variant` input — only badge/status-dot changed.)

**2. Wire the colours via `styles/status`** (replaces the removed factory `--status-*` tokens and
per-status classes — see `status-lifecycle-tokens-removed` in `../0.5.1.json`):

```scss
@use '@ids-group-ltd/ids-design-system/styles/status' as status;
@include status.define(
  (
    'active': (
      bg: …,
      text: …,
    ),
    'completed': (
      bg: var(--success),
      text: var(--text-on-success),
    ),
    // …one entry per status value you pass to [status]
  )
);
```

**3. Augment `DsStatusRegistry`** (TS) with the same keys — see the type section above.

**4. Drop the removed exports/tokens.** The types `BadgeVariant` / `BadgeLifecycle` /
`BadgeSemantic` / `StatusValue` and the factory `--status-planning-*` / `--status-confirmed-*` /
`--status-active-*` / `--status-completed-*` tokens no longer exist; delete any references.

### If you coloured badges with your own CSS class (not the factory statuses)

A consumer may have styled badges by a **status-named class** it set itself, e.g.
`class="chip {{ status }}"` + `ds-badge.chip.completed { --ds-badge-bg-color: … }`, rather than via
`[variant]`. That keeps working mechanically (the `--ds-badge-*` hooks are unchanged), **but** any
value that previously fell through to a _factory_ colour (because you had no class rule for it) is
now uncoloured. The clean fix is to stop keying colour off the class and move to the status API:

```html
<!-- before: colour keyed off the interpolated class -->
<ds-badge class="chip {{ status }}">{{ label }}</ds-badge>
<!-- after: class kept for layout only, colour via [data-status] -->
<ds-badge class="chip" [status]="status">{{ label }}</ds-badge>
```

```scss
// before: colour per class            // after: colour per status key, once
ds-badge.chip.completed { … }          @include status.define(( 'completed': (bg: …, text: …), … ));
ds-badge.chip.in-transit { … }         // .chip now carries layout rules only
```

This unifies every badge on one mechanism and restores the values that used to rely on factory
colours.
