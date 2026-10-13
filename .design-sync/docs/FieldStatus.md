---
category: Forms & inputs
---
The trailing marks inside a form control - a spinner while the value is being checked, a dot once the user has changed it - `ds-field-status`, drawn by every DS field itself. It has no component of its own to place: set the state on the field.

- `pending` shows the spinner; signal forms bind it while an async validator runs.
- `dirty` shows the dot, but only under `showDirty` on the field, `dsShowDirty` on a form, or `provideDsConfig({ field: { showDirty: true } })` app-wide; the "Changed" text goes on the field's message line.

```tsx
<Input label="Company" pending />
<Input label="City" dirty showDirty />
```
