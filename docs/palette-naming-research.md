# Naming the gray ramp: "neutral" vs "gray/slate" at the primitive tier

> Research note, 2026-06-11. Question: our palette (tier 1, concrete colors) names
> its gray ramp `--neutral-*` while chromatic ramps use appearance names
> (`--blue-*`, `--red-*`). Is "neutral" a semantic word leaking into the color
> layer, and what do standards/systems actually do?

## What authorities say

- **No standard prohibits "neutral" at tier 1.** W3C DTCG format is explicitly
  non-prescriptive on names; Style Dictionary: "no restrictions"; Brad Frost
  takes no position.
- **Nathan Curtis (EightShapes)** uses *both* in his own writing:
  `$esds-color-neutral-42` (neutral as primitive) in one system and
  `$color-gray-05` in another. Never flags either as wrong.
- The implicit principle several sources state: tier 1 is "named by what they
  are, not what they do". The catch: "neutral" is ambiguous — it can be read
  descriptively ("near-zero chroma") or semantically ("for neutral roles").

## What real systems do (verified against docs/repos)

| "neutral" as primitive ramp name | "gray"/"slate" as primitive ramp name |
|---|---|
| **Tailwind v4** (`neutral` is literally one of the gray families) | **Radix** (`gray`, `slate`, `mauve`, `sage`, `olive`, `sand`) |
| **Material 3** (`md.ref.palette.neutral`, `neutral-variant`) | **Carbon** (`gray`, `cool-gray`, `warm-gray`) |
| **Atlassian** (`Neutral0`–`Neutral1100`) | **Spectrum** (`gray-50…900`) |
| **shadcn** (inherits Tailwind `neutral`) | **Primer** (`base.color.gray.0–13`) |
| | **Polaris** (`gray-N`; historically `ink`+`sky`) |
| | **Fluent 2** (`grey[N]`; "neutral" appears only at alias tier: `colorNeutralBackground1`) |

Roughly a 4 : 6 split; the enterprise camp leans "gray".

## Two nuances that decide it for us

1. **In the Tailwind/Radix vocabulary — the one most developers know — "neutral"
   means *pure achromatic* (zero cast), and "slate" means *cool, blue-cast
   gray*.** Our ramp (`--neutral-500 #6B7388` ≈ hsl(223°, 12%, 48%)) is
   textbook **slate**, not neutral. Keeping the name "neutral" mildly
   misdescribes the color by that convention.
2. **Material 3's `neutral` is generated from the brand hue** (source color at
   chroma 4) — i.e. M3's "neutral" is *the low-chroma companion of the brand*.
   That is exactly our design: hue 223 ≈ brand hue 229, desaturated. M3 is the
   strongest precedent for calling a brand-derived gray ramp "neutral".
   Radix's pairing guide agrees from the other side: `slate` is the gray they
   recommend *for blue/indigo brands*.

## Decision rule

The right name depends on intent, not taste:

- **If neutrals are conceptually brand-coupled** (a future brand/theme would
  re-derive its grays from its own hue, M3-style — plausible for us: secondary
  and tertiary already derive from brand channels) → **keep `--neutral-*`**.
  "Neutral" then correctly means "the brand's low-chroma companion ramp,
  whatever its hue". Add one doc line in `_palette.scss`: *neutral = system
  gray ramp; in this palette a cool slate (hue ≈ 223°, harmonized with brand
  hue 229°)*.
- **If the grays are fixed forever** (cool slate regardless of brand) →
  **rename to `--slate-*`** (Tailwind/Radix vocabulary) or Carbon-style
  `--cool-gray-*`, keeping `--neutral-X: var(--slate-X)` as deprecated aliases
  for one release (the palette is published CSS API — downstream apps may
  reference it).

Either way, two related fixes stand regardless (from the neutral-0 discussion):
a non-flipping `--static-white` primitive for on-roles (`--text-on-primary`
etc.), and removing tier-3 → tier-1 shortcuts (`--scrollbar-thumb:
var(--neutral-400)`).

## Sources

- https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676
- https://medium.com/eightshapes-llc/color-in-design-systems-a1c80f65fa3
- https://www.designtokens.org/tr/drafts/format/
- https://styledictionary.com/info/tokens/
- https://www.smashingmagazine.com/2024/05/naming-best-practices/
- https://tailwindcss.com (v4 palette), https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette
- https://carbondesignsystem.com/elements/color/overview/ (@carbon/colors)
- material-foundation/material-tokens (md.ref.palette), https://atlassian.design/components/tokens/all-tokens
- https://primer.style (base.color.gray), Polaris/Fluent token sources
