---
category: Forms & inputs
---
Live checklist under a password field — each rule ticks as the value satisfies it. Shows the user what is still missing instead of failing them on submit.

- `value` is the password being typed; the component derives every rule's state from it and renders nothing interactive.
- `rules` is the rule set (`DsPasswordRule[]`). Order them the way they should be read, shortest first.
- `showUnmet` keeps unsatisfied rules visible from the start — the honest default for a register form. Turn it off to reveal rules only as they are broken.
- `columns`: `1` (default) or `2`, for a long rule set in a narrow card.
- `listId` is the id the password Input points `aria-describedby` at, so the checklist is announced with the field.

```tsx
<PasswordRules value={password} rules={rules} listId="pw-rules" columns={2} />
```
