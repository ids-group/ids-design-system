# InlineEdit

Text renamed in place (`ds-inline-edit`): plain text that turns into a field of the same font and size on a click, Enter, Space or F2, with the text selected. Hover tints the background behind the text and shows a pencil with a "Rename" tooltip.

- `value` / `onValueChange`: the text. Enter or leaving the field saves, Escape cancels; a blank or unchanged value saves nothing.
- `onSaved` fires with the trimmed new value after a save.
- `placeholder` shows while `value` is empty; `maxLength` caps the field.
- `disabled` renders the text with no edit affordance.
- `ariaLabel` names the field, for example "Rename shipment".

```tsx
<InlineEdit value={name} onValueChange={setName} ariaLabel="Rename route"
  placeholder="Untitled route" maxLength={60} onSaved={saveRouteName} />
```
