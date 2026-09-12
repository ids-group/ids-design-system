# A `ds-button` back-link announces itself as the current page

Bug, 2026-09-11, found while migrating the public marketing site of
[`ds-button-needs-a-destination.md`](./ds-button-needs-a-destination.md) onto `ds-button`. Split out
of [`ds-button-destination-modifiers.md`](./ds-button-destination-modifiers.md) so it can be answered
on its own — it is small, and unrelated to the missing inputs there.

## What was measured

The `routerLink` branch of the button's template hardcodes `routerLinkActive` and derives
`aria-current` from it:

```html
<a #btn #rla="routerLinkActive" routerLinkActive="active"
   [routerLink]="disabled() ? null : routerLink()"
   [attr.aria-current]="rla.isActive ? 'page' : null" …>
```

`routerLinkActive` matches by **prefix** unless given `routerLinkActiveOptions: { exact: true }`, and
`ds-button` exposes no such input. So on the consumer's case-study detail page, at
`/case-studies/how-ids-delivered-a-cloud-native-works-management-platform-on-aws-for-evifile`, the
button back to the list renders:

```html
<a href="/case-studies" class="button lg v-outline active" aria-current="page">All case studies</a>
```

Read from the live DOM, not from the template.

## Why it matters

`aria-current="page"` means *this is the page you are on*. Here it is on a link whose entire purpose
is to leave the page you are on, so a screen reader announces "current page" for the way out. A
sighted reader is unaffected — `.active` has no rule in the button's stylesheet, so nothing is
painted. That is what makes it worth reporting: **it is invisible to everyone except the users it
misleads**, and no consumer will find it by looking.

The shape is not exotic. "Back to the section" is the commonest control on any detail page, and its
destination is always a prefix of the current URL — so every consumer who follows the recipe in
`ds-button-needs-a-destination.md` gets this on exactly those buttons. Two of this consumer's
migrated controls are affected today; every future one of that shape will be.

## There is no consumer-side fix

`routerLinkActive` lives on the anchor the component renders inside itself. A consumer cannot pass
options to it, cannot reach the directive instance, and cannot strip an attribute the component
writes. Overriding `aria-current` from outside would mean reaching past the public API, which
`design-system.md` §7 rules out.

## Two ways out, either is fine

1. **Expose `routerLinkActiveOptions`**, forwarded to the anchor, so a consumer can ask for
   `{ exact: true }` where the link points at an ancestor route. Smallest change, and it also lets a
   consumer control the `active` CLASS, which has the same prefix behaviour.
2. **Decouple `aria-current` from the class and make it exact-only.** The class is a visual state and
   `aria-current` is a factual claim; they do not have to share a matcher, and the factual one should
   be the strict one. This needs no new input and fixes every consumer without them knowing there was
   a bug — which, given nobody can see it, is the stronger argument.

`ds-sidenav-item` should be checked for the same shape at the same time: a sidenav item legitimately
wants prefix-active for its highlight, but the same question applies to what it announces.

## Answered 2026-09-12 — the class and the claim stopped sharing a matcher

`aria-current` is no longer derived from `routerLinkActive`. An EXACT match announces `page`, a
PREFIX match announces `true`, and anything else announces nothing — which is what ARIA means by
each: `page` is the page you are on, `true` is the current section or an ancestor of it. So a
"back to the section" link now says it is the section, which it is.

The `active` CLASS still matches by prefix, so nothing moved on screen. Two inputs are public for
the cases the default cannot know: `routerLinkActiveOptions` moves what the class matches, and
`ariaCurrent` overrides what the link announces — `null` to say nothing, `'step'` or `'location'`
where the link is not a page.

**Measured in the built docs app, on `/components/button`:** a button to `/components/button`
announces `aria-current="page"`; a button to `/` announces `aria-current="true"`; the three buttons
pointing elsewhere carry no attribute at all. Both active links keep the `active` class, so the
prefix behaviour the class is there for is intact.

**The same fix landed on `ds-sidenav-item` and `ds-sidenav-group`**, which had the identical
construction — and in the sidenav it was visible, because there the `active` class is painted.
`ds-sidenav-group` announced nothing at all before; its header now follows the same rule.

**One mechanism detail worth recording, because it cost an afternoon.**
`RouterLinkActive.update()` calls `removeAttribute('aria-current')` on its host in a microtask
whenever its own `ariaCurrentWhenActive` is unset. A template binding of `[attr.aria-current]` on
the same element is therefore written and then silently wiped — which is why the first
implementation measured correct values internally and rendered no attribute. The value has to go
through `ariaCurrentWhenActive`, and `docs/agent/` says so now.

