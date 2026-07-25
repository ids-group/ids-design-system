---
category: Actions
---
Main action button + chevron dropdown trigger fused into one control. The main button fires `onPressed` immediately; the chevron opens a menu of alternative actions (`menuItems`) and `onItemSelected` fires with the chosen item (which also closes the menu). Two visual styles via `variant`: `primary` (solid accent, default) and `outline` (use when it sits alongside a primary action).

- `menuItems: SplitButtonItem[]` — `{ label, value?, icon?, disabled?, error? }`; `error: true` styles a destructive item.
- `label` is the main button text; optional `icon` renders before it. `menuLabel` (default "More actions") names the chevron trigger for assistive tech.
- `open`/`onOpenChange` control the dropdown; uncontrolled toggling works out of the box. The open menu renders INLINE inside the host (no portal) — it flows next to the buttons rather than floating.
- `disabled` disables both halves.

```tsx
<SplitButton
  label="Save"
  menuLabel="More save options"
  menuItems={[
    { label: 'Save and dispatch', value: 'dispatch' },
    { label: 'Save as draft', value: 'draft' },
    { label: 'Discard changes', value: 'discard', error: true },
  ]}
  onPressed={save}
  onItemSelected={(item) => run(item.value)}
/>
```
