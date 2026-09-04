# How leading design systems derive interaction-state colors

> Research base for the interaction-formula work (see `interaction-color-audit.md`
> and `presentations/3-interaction-formula.html`).
> Method: deep-research workflow, 2026-06-10 — 5 search angles, 24 sources fetched,
> 115 claims extracted, top 25 adversarially verified (3 votes each, 2/3 refutes
> kill), 18 confirmed → 11 synthesized findings. Confidence reflects vote splits:
> _high_ = anchored by unanimous 3-0 votes, _medium_ = 2-1 splits or synthesis.

## Executive summary

Leading systems **converge on the public CSS contract** — a named semantic token
per state (`-hover` / `-active` / `-selected` / `-disabled` suffixes) — but
**diverge on how values are produced**:

- **Runtime-procedural**: only Material 3 (state layers — fixed-opacity overlay
  in the component's _content_ color).
- **Hand-picked ramp steps**: Fluent 2, Carbon, Radix, Polaris — states point at
  pre-chosen stops of designed ramps; zero runtime math.
- **Build-time generated**: Adobe Spectrum — ramps generated from target
  contrast ratios (Leonardo, CIECAM02-UCS) with heavy manual calibration;
  states = uniform contrast increments along the generated ramp.

The rule "pressed = 2×hover" is **not universal anywhere**: Carbon ≈ 4×
(half-step hover vs 2-step active), Spectrum = equal increments (+1 / +1),
Radix = 2× but as discrete hand-drawn steps, M3 ≈ 1.25–1.5× (spec numbers
internally contradictory). Every system calibrates its own ratio.

The "formula deadens the color" problem is solved by **direction, not magnitude**:
M3 mixes toward the related on-color (same hue family), Carbon/Fluent flip
direction on dark backgrounds (hover gets _lighter_), Spectrum works in a
perceptual space with a hand-tuned lightness curve. **Nobody darkens uniformly
toward black.**

## Per-system findings

### Material 3 — runtime state layers _(confidence: medium, 2-1 votes)_

- State = semi-transparent **state layer** with fixed opacity per state, painted
  over the unchanged enabled container color. No per-state color tokens.
- Anti-desaturation key: the layer color is **the component's content color**
  (semantic on-role, e.g. `on-secondary-container`) — mixing moves along the
  same tonal palette, hue/chroma stay coherent.
  > "The state layer is an overlay with a fixed opacity for each state and uses
  > the same color as the content."
- `disabled` is the exception: fixed opacity tokens (on-surface 38% content /
  12% container), not a state layer.
- ⚠️ Exact percentages (hover 8%, pressed 12% vs 16%) are **internally
  contradictory across spec sections** (material-components-android issue #2003)
  — the specific-numbers claim was REFUTED 1-2. Don't cite M3 numbers without
  checking current `md.sys.state.*` tokens.

### Fluent 2 — hand-picked alias tokens _(confidence: high)_

- Two-tier architecture: context-agnostic global ramp tokens + semantic alias
  tokens with the state as a name variant (`colorNeutralBackground1Hover` →
  `grey[96]`, `colorStatusDangerBackground3Pressed` → `cranberry[shade20]`).
  Confirmed against source (`packages/tokens/src/alias/lightColor.ts` /
  `darkColor.ts`) — zero runtime computation.
- Steps are non-uniform, theme-dependent and **non-monotonic**:
  - light: rest `white` → hover `grey[96]` → pressed `grey[88]` → selected `grey[92]`
  - dark: rest `grey[16]` → hover `grey[24]` (**lighter** than rest) → pressed
    `grey[12]` (darker) → selected `grey[22]`
    A single lighten/darken formula cannot reproduce this (hover lighter AND
    pressed darker from the same rest value).
- Docs state only a directional rule:
  > "Generally, a component will get darker as someone interacts with it, from
  > the lightest rest state, to a darker hover, all the way to the darkest
  > selected state."

### Carbon — ramp steps with hand-drawn half-steps _(confidence: medium, 2-1)_

- Per-state suffix tokens (`$background-hover`, `$button-primary-active`),
  five interaction states per theme, values hardcoded per theme.
- Fixed step magnitudes: **hover = half step, selected = 1 full step, active =
  2 full steps** (Blue 60 → active Blue 80) — i.e. active ≈ 4× hover in ramp
  steps. Clamping at scale ends.
- **Direction flips mid-scale**:
  > "For values between Black and Gray 70, interaction gets lighter. For values
  > between Gray 60 and White, interaction gets darker."
- Hover values are hand-authored **"half steps" deliberately outside the core
  10–100 ramp** — even a ramp-based system found full steps too coarse for hover.
- ⚠️ Nuance: the Carbon team itself later flagged hardcoded half-steps as tech
  debt and proposed replacing them with computed lighten/darken (~−8% lightness,
  carbon repo issue #4049) — direct precedent for a calibrated formula replacing
  hand picks.

### Radix Colors — purpose-assigned scale steps _(confidence: high)_

- Hand-built 12-step scale with hard-wired state indices:
  > "Step 3 is for normal states. Step 4 is for hover states. Step 5 is for
  > pressed or selected states." / "Step 10 is designed for component hover
  > states, where step 9 is the component's normal state background."
- Step 9 = "the purest step, mixed with the least amount of white or black" —
  curated chroma, not a formula. No solid-fill pressed step exists (known
  community pain, radix-ui/colors#48).

### Adobe Spectrum — build-time generation + curation _(confidence: high)_

- v6.0 abandoned static hand-drawn swatches for an **adaptive color palette**:
  all gray values except the base background are generated from **target
  contrast ratios** against the theme background (open-source tool Leonardo).
  Dark themes target _higher_ ratios for perceptual parity. Generation is
  build-time, never runtime.
- States = uniform ramp increments:
  > "when a user enters a hover state, the component increases in contrast by
  > one unit. The down (pressed) state increases in contrast by one more unit."
- Perceptual machinery: CIECAM02-UCS with lightness stops synchronized to
  contrast ratios.
- **First-person trade-off evidence** _(medium — source article now 404s,
  verified via corroborating snippets)_:
  > "No color space, uniform or other, provided a lightness progression that
  > appeared visually balanced. This was especially true with lighter tints."
  > Their answer: per-scale choice of whichever space gives the smoothest
  > gradient + a custom polynomial lightness curve (Stevens' power law). Pure
  > algorithm failed aesthetically; calibrated formula + curation won.

### Polaris — enumerated state tokens _(confidence: high)_

- > "Interaction states are communicated by adding -hover, -active, -selected,
  > or -disabled to the end of the semantic token."
  > Static rgba values (e.g. `--p-color-bg-surface-hover: rgba(247,247,247,1)`).

## Cross-cutting patterns

**Architecture** _(high)_: the dominant public contract is a named token per
state pointing at a static value. Runtime computation in production: only M3's
alpha compositing. No verified system uses runtime `color-mix()`/OKLCH for
states (absence of evidence ≠ evidence of absence; this remains our open
question #4).

**Anti-desaturation strategies** _(medium, synthesis)_ — three verified moves:

1. Mix toward a semantically related color, not black (M3 on-color).
2. Direction depends on background lightness, always moving toward contrast
   (Carbon's Gray 70/60 flip; Fluent dark hover lighter than rest).
3. Perceptual space + hand-tuned curve at generation time (Spectrum).

**pressed : hover ratio** _(medium, synthesis)_: no universal constant.
M3 ≈ 1.25–1.5×, Carbon ≈ 4×, Radix 2× (discrete), Spectrum 1× (equal
increments), Fluent non-monotonic. Treat any fixed ratio as a calibrated
default, not a law.

## Refuted / unverified (do not cite)

- M3 exact opacities "8/10/10/16" — refuted 1-2 (spec self-contradictory).
- Fluent "brand pressed = 4× hover" — refuted 1-2.
- Spectrum "chromatic ramps in perceptual space with polynomial contrast curve"
  as stated — refuted 1-2 (the verified version is narrower, see above).
- Polaris "no numeric derivation disclosed" — refuted 1-2.
- **Coverage gaps**: Atlassian DS, GitHub Primer, shadcn/ui — no claim survived
  verification; absent from this report despite being in the question.

## Implications for our system (vs the v2 prototype)

1. **Our v2 direction presets are independently validated**: "mix toward brand"
   = M3's on-color principle; "toward white on dark bases" = Carbon/Fluent
   direction flip; cool ink instead of black = the same anti-desaturation move.
2. **Per-state custom properties as the public contract** match industry
   consensus. Our `ds-interactive` contract still _exposes_
   `--interactive-hover/-active` — components/themes can override them directly,
   which is exactly the "hand pick where the formula is too coarse" escape hatch
   (Carbon half-steps precedent).
3. **pressed = 2×hover should be a default, not a law.** Our own calibration
   already confirms this: 2× lands on the ramp for accent-ink (7/14) and ink
   (6.5/13), but tint pressed wants ~34% rather than 28%, and links use 20/35.
   Keep per-context step pairs (as v2 already does).
4. **Runtime color-mix is our differentiator, not common practice.** Verified
   systems bake values at design/build time. Our approach is architecturally
   closest to M3 (the only proven runtime system) but with broader presets.
   Carbon's issue #4049 (replace hand half-steps with computed ~−8% lightness)
   shows the industry drifting our way.
5. **A dark theme will need its own calibration pass** — every verified system
   changes both direction and magnitudes in dark mode (Fluent non-monotonic,
   Spectrum higher contrast targets). Our `--state-into`/step tokens support
   this, but the numbers must be re-derived, not reused.

## Open questions

- Current canonical M3 `md.sys.state.*` opacity values (12% vs 16% pressed)?
- Did Spectrum 2 (2023+) keep the "+1/+1 contrast unit" rule and Leonardo/CAM02?
- What do Atlassian, Primer, shadcn actually do (no surviving claims)?
- Any production system using runtime `color-mix()`/OKLCH for states?

## Primary sources

- https://m3.material.io/foundations/interaction/states/state-layers
- https://fluent2.microsoft.design/color-tokens · https://fluent2.microsoft.design/color
- github.com/microsoft/fluentui — `packages/tokens/src/alias/lightColor.ts`, `darkColor.ts`
- https://carbondesignsystem.com/elements/color/overview/ (+ carbon issue #4049)
- https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale
- https://spectrum.adobe.com/page/color-system/
- https://adobe.design/stories/design-for-scale/reinventing-adobe-spectrum-s-colors (404 — verified via snippets)
- https://polaris-react.shopify.com/design/colors/color-tokens
- github.com/material-components/material-components-android issue #2003
