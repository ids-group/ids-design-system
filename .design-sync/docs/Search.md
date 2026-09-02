---
category: Forms & inputs
---
Compact quick-filter search box for toolbars and topbars — a leading search icon, borderless input, optional clear button and `<kbd>` shortcut badge. Lighter-weight than `Input type="search"` (no label/hint/validation anatomy).

- Value: `value` + `onValueChange` (controlled) or just an initial `value`; `onSubmitted` fires with the current value on Enter.
- `clearable` shows an inline × when non-empty (clearing refocuses the input); `showIcon={false}` hides the leading icon.
- `shortcut` renders a trailing keyboard hint like "⌘K" (display only — wire the hotkey yourself).
- `placeholder` defaults to "Search"; set `ariaLabel` for a proper accessible name.

```tsx
<Search placeholder="Search shipments" shortcut="⌘K" clearable onSubmitted={runSearch} />
```
