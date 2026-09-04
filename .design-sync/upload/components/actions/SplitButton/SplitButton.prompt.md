# SplitButton

Main action button + chevron dropdown trigger fused into one control. The main button fires `onPressed` immediately; the chevron opens a menu of alternative actions (`menuItems`) and `onItemSelected` fires with the chosen item (which also closes the menu). Two visual styles via `variant`: `primary` (solid accent, default) and `outline` (use when it sits alongside a primary action).

- `menuItems: SplitButtonItem[]` — `{ label, value?, icon?, disabled?, error? }`; `error: true` styles a destructive item.
- `label` is the main button text; optional `icon` renders before it. `menuLabel` (default "More actions") names the chevron trigger for assistive tech.
- **The chevron owns its own open state — there is no `open` prop.** It toggles on click and on ArrowDown, and the menu is a CDK popover PORTALED to `document.body`, so it floats over the layout rather than flowing next to the buttons. A card cannot show it open.
- **Without `menuItems` the chevron opens an empty panel.** Pass the items or the control looks broken.
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
