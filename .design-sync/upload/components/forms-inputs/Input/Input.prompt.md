# Input

Single-line text field. Label above (or inside with `floating`), helper `hint` below, validation via `invalid`/`success` (error text goes in `hint`). Sizes `sm`/`md`/`lg` = 32/40/48px.

- Value: pass `value` + `onValueChange` (controlled) or just an initial `value`.
- `type="search"` shows a clear × by default (`clearable` overrides); `type="password"` + `passwordToggle` adds show/hide; `maxLength` adds a live counter.
- `prefix`/`suffix` render addon content — set `withAddon`/`withAddonRight` to reserve the space.
- `required` shows an asterisk; `optional` shows "(optional)"; `loading` shows a trailing spinner (pair with a hint like "Checking availability…").

```tsx
<Input label="Email address" placeholder="you@company.co.uk" hint="Work email preferred." />
<Input label="Username" value={name} onValueChange={setName} invalid hint="Already taken." />
```
