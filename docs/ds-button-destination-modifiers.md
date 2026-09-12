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

## A second finding, filed separately

The `routerLink` branch also makes a back-link announce `aria-current="page"`, because
`routerLinkActive` is hardcoded with prefix matching and no `routerLinkActiveOptions`. It is
unrelated to the missing inputs above and small enough to answer on its own, so it lives in
[`ds-button-router-link-active-claims-the-page.md`](./ds-button-router-link-active-claims-the-page.md).

The token surface has four holes of its own, found while branding the button to this site —
[`ds-button-token-surface-holes.md`](./ds-button-token-surface-holes.md).

## What it unblocks

The consumer is at 18 of 31 today and holds a hand-written `.btn` class for the other 13 — the same
class the previous Ask retired for the first 18. Preference 1 closes it: all 31 controls on one
component, and the class deleted rather than kept at a third of its former size.

## Answered 2026-09-12 — preference 1, and the `UrlTree` behind it

`fragment`, `queryParams`, `queryParamsHandling`, `target` and `rel` are inputs on `ds-button`.
Each is a pass-through to the anchor the component already renders, and each is the same shape as
`type` and `loading`: meaningless on a destination that cannot carry it, and dev-warned there
rather than silently dropped — `fragment` and the two query inputs need a `routerLink`, `target`
and `rel` work on either link.

**`routerLink` also accepts a `UrlTree` now**, which is the cheaper half of the same answer: it
reaches the `UrlCreationOptions` that have no input here — `relativeTo`, `preserveFragment` — with
no new surface at all.

```html
<ds-button [routerLink]="['/ai-solutions', slug]" fragment="enquiry">Talk to us</ds-button>
<ds-button [href]="demoUrl" target="_blank" rel="noopener">Open the demo</ds-button>
```

```ts
// for the options with no input of their own
protected readonly enquiry = this.router.createUrlTree(['/ai-solutions', slug], {
  fragment: 'enquiry',
});
```

**Measured in the built docs app, all three arms:** `[queryParams]="{ from: 'buttons' }"` renders
`href="/components/input?from=buttons"`; `target="_blank" rel="noopener"` reach the anchor
verbatim; and the plain `routerLink` destination is unchanged.

**The same widening landed on `ds-sidenav-item` and `ds-sidenav-group`**, because the Ask is right
that this was a library-wide shape rather than a button oversight. The modifier INPUTS stayed on
the button, where the request was measured — the two sidenav components take the `UrlTree`, which
covers the routed half of the gap for them at no cost.

Preference 2 (one `destination` object) was declined: it closes the same gap while forcing a field
in the class where an attribute used to do, and leaves two roads to the same destination inside the
component. Preference 3 was declined because it would put back the hand-written class the previous
Ask retired.

**The `.btn` class can go.** All 31 controls move now (delete list:
`hand-written-button-class-for-modifiers`), and so can any `RouterLink` import added solely to
write the missing inputs on a `<ds-button>` (delete list: `routerlink-imported-for-extra-inputs`).

