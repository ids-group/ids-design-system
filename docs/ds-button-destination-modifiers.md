# `ds-button` has a destination but no way to modify it

Request, 2026-09-11, from the same public marketing site as
[`ds-button-needs-a-destination.md`](./ds-button-needs-a-destination.md) — filed after migrating that
consumer onto the answer.

## First, the part that worked

The destination work shipped in 0.12.3 and it is good. **18 of the consumer's 31 button-styled
controls moved onto `ds-button` with no visual change at all** — measured on the built page, the
replaced control and its replacement are identical to two decimal places:

| | `.btn` before | `ds-button` after |
|---|---|---|
| box | 204.06 × 56 | 204.06 × 56 |
| padding | 16px 24px | pinned height, 24px inline |
| radius / fill / label | 12px · `#fcc634` · `#1c3558` | identical |
| font | Source Sans Pro 600 16px | identical |

Everything needed to get there was a public `--ds-button-*` token plus the reflected `data-color` /
`data-variant` host attributes, which are exactly the right seam — no internal class was touched.
One click on a migrated CTA produces one `pushState` and one `pressed`, so navigation and analytics
both survive the swap.

## The measurement that blocks the other 13

The remaining **13 controls cannot move**, because a destination on `ds-button` cannot be modified:

| missing input | controls blocked | what they do today |
|---|---|---|
| `fragment` | **6** | `[routerLink]="['/ai-solutions', slug]" [fragment]="'enquiry'"` — deep-link into a section |
| `queryParams` | **5** | `routerLink="/contact" [queryParams]="{ intent }"` — carry the lead intent |
| `target` + `rel` | **3** | `[href]="url" target="_blank" rel="noopener"` — an external demo |

(6 + 5 + 3 = 14 because one control needs both `fragment` and `queryParams`.)

`ButtonComponent` declares `routerLink` and `href` and nothing else about the destination. The
`RouterLink` directive is in the component's own `dependencies` with all eleven of its inputs —
`target`, `queryParams`, `fragment`, `queryParamsHandling`, `state`, `info`, `relativeTo`,
`preserveFragment`, `skipLocationChange`, `replaceUrl` — but the template binds only `[routerLink]`,
so none of the other ten is reachable from outside the component.

**`ds-sidenav-item` has the same gap**, so this is a library-wide shape rather than a button
oversight: grepping the whole published type surface for a `queryParams` or `fragment` INPUT returns
nothing on any component.

## Why every workaround is worse than the gap

- **Fold the query and fragment into the `routerLink` string.** `RouterLink` passes its commands to
  `Router.createUrlTree`, which treats them as path segments — `?` and `#` are percent-encoded, and
  the link goes to a URL that does not exist.
- **Use `href` with a serialized URL instead.** That is a full document load. Turning in-app
  navigation into a page reload to keep a button's styling is a bad trade on any page, and on a
  marketing site it is the conversion path.
- **Also import `RouterLink` in the consumer and write the extra inputs on `<ds-button>`.** The
  directive's `[routerLink]` selector matches the host, so this compiles — and now TWO `RouterLink`
  instances exist for one control, disagreeing about where it goes: the host's would navigate to
  `/contact?intent=x`, the anchor's inside the component to `/contact`. Which one wins is a
  listener-ordering detail, not a contract.

  Worth recording, because it is the one part of this that is better than feared: on the migrated
  pages, which DO import `RouterLink` alongside `<ds-button routerLink>`, a click was measured
  producing exactly **one** `pushState` and **one** `pressed`. So the double binding is latent
  today rather than broken — but it is not a mechanism to build the missing inputs on.
- **Copy the button's classes onto a plain anchor.** `design-system.md` §7 rules this out by name,
  and it is what the previous Ask already retired.

## What is being asked for

In preference order:

1. **Forward the destination modifiers.** `fragment`, `queryParams` and `queryParamsHandling` on the
   `routerLink` branch; `target` and `rel` on the `href` branch. Each is a pass-through to the
   element the component already renders, and each is meaningless on the branches it does not apply
   to — the same shape as `type` and `loading`, which are button-only and dev-warn elsewhere.
2. **One `destination` object input** — `{ routerLink?, href?, fragment?, queryParams?, target?,
   rel? }` — if six more inputs on the class is the objection. It reads worse at the call site but
   it closes the same gap and leaves room for the rest of `RouterLink` later.
3. **Say the gap is deliberate and name the supported alternative**, so consumers stop each
   inventing one. If the answer is "a control that needs a modified destination is not a
   `ds-button`", that is a usable answer — but then the recipe in the previous Ask needs the
   exception written into it, because today it reads as though every navigating control is covered.

## Second finding: the back button announces itself as the current page

Separate from the above, and cheap to fix.

The `routerLink` branch hardcodes `routerLinkActive="active"` and derives
`[attr.aria-current]="rla.isActive ? 'page' : null"` from it. `routerLinkActive` defaults to
**prefix** matching, and there is no `routerLinkActiveOptions` input to change that.

So a "back to the section" button — the commonest control on any detail page — claims to be the page
you are already on. Measured on the consumer, at `/case-studies/<slug>`:

```html
<a href="/case-studies" class="button lg v-outline active" aria-current="page">All case studies</a>
```

A screen reader announces "current page" for a link whose whole purpose is to leave the current page.
Two ways out, either is fine:

- expose `routerLinkActiveOptions` so the consumer can ask for `{ exact: true }`, or
- make `aria-current` exact-only regardless of the `active` CLASS, since the class is a visual state
  and `aria-current` is a factual claim, and the two do not have to share a matcher.

## What it unblocks

The consumer is at 18 of 31 today and holds a hand-written `.btn` class for the other 13 — the same
class the previous Ask retired for the first 18. Preference 1 closes it: all 31 controls on one
component, and the class deleted rather than kept at a third of its former size.
