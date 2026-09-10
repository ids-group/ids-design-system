# Four holes in `ds-button`'s token surface, and what a consumer writes instead

Request, 2026-09-11, from the public marketing site of
[`ds-button-needs-a-destination.md`](./ds-button-needs-a-destination.md), found while branding the
button to that site.

## The good news first

`ds-button` ships **19 public `--ds-button-*` tokens**, and they carried almost the whole job. The
site's call to action was reproduced byte-exactly — `204.06 × 56`, radius 12, `#fcc634` on
`#1c3558` — from six of them (`height`, `pad-x`, `radius`, `font-size`, `weight`, `tracking`) plus
the reflected `data-color` / `data-variant` host attributes. **No internal class was touched**, which
is the outcome `design-system.md` §7 is asking for and it was reachable.

Four things were not reachable, and in three of them the consumer had to re-point a **theme-wide
role inside the component's subtree** to get there. That works, and it is the wrong shape.

## Gap 1 — the label face

```css
.button { font: var(--_button-weight) var(--_button-font-size)/var(--line-height-flat) var(--font-sans); }
```

The weight and the size are tokenised. The **family** and the **line-height** are not: they read
`--font-sans` and `--line-height-flat` directly. This site sets headings in Source Sans Pro and body
in Inter, and its buttons are headings — so with the DS defaults every button silently switched face.

What the consumer had to write:

```scss
ds-button { --font-sans: var(--app-font-heading); }
```

That says "inside a button, the sans role means the heading face", which is not true of the app and
is not what the consumer means. It also reaches everything else the component renders — `ds-icon` and
`ds-field-message` are both inside the button and both inherit it.

**Asked for:** `--ds-button-font-family` and `--ds-button-line-height`, alongside the weight and size
that are already there.

## Gap 2 — the border WIDTH

```css
border: var(--border-width-default) solid var(--_button-border);
```

`--ds-button-border` sets the border's **colour**; nothing sets its width. The consumer's solid
buttons drew no border at all and its outline buttons drew 2px, so with the DS's 1px every solid
button came out **2px wider than the control it replaced** — measured, `204.06` against `206.06`.

What the consumer had to write:

```scss
ds-button[data-variant='solid'] { --border-width-default: 0; }
ds-button[data-variant='outline'] { --border-width-default: 2px; }
```

Same objection as gap 1, and worse: `--border-width-default` is a Tier-3 scale token, so this
redefines a scale step for a subtree in order to change one component's edge.

**Asked for:** `--ds-button-border-width`. `--ds-button-border` naming the colour while the width
comes from a global scale is also a naming trap on its own — a consumer reads `--ds-button-border`
and reasonably expects to set `2px solid red` with it.

## Gap 3 — the label colour has no hover

The background has four states and the label has two:

| | base | hover | active | disabled |
|---|---|---|---|---|
| `--ds-button-bg-color-*` | ✓ | ✓ | ✓ | ✓ |
| `--ds-button-label-color-*` | ✓ | **—** | **—** | ✓ |

`.button:hover` sets `background-color` and `box-shadow`, and nothing else. So a button whose label
changes on hover cannot be expressed at all.

That is not a hypothetical: this site's outline button inverted — transparent-with-ink became
ink-with-white, the treatment its live theme has always shipped. There is no consumer-side way to
write it, so **the site changed behaviour to match the library**: the outline button now washes its
ground and holds its label. That is defensible, and arguably nicer — a label that does not flash to
its opposite mid-gesture. But it was the library's choice, not the consumer's, and the consumer had
no way to have the conversation except by giving up the treatment.

**Asked for:** `--ds-button-label-color-hover` and `--ds-button-label-color-active`, defaulting to
`--ds-button-label-color` so nothing changes for anyone who does not set them.

## Why this is worth fixing rather than living with

The three workarounds all have the same shape: **a consumer redefines a THEME role inside a component
to change that component.** It compiles, it is invisible in review, and it silently reaches every
child the component renders. Multiply it across a few components and the theme layer stops meaning
what it says — which is the failure the three-tier token architecture exists to prevent.

Each gap is one `var(--ds-button-…, <current value>)` at the point the value is already read, so no
default moves and nothing needs a migration entry.
