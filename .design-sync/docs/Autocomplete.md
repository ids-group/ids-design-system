---
category: Forms & inputs
---
Combobox that filters options as you type. Single-select shows the picked label beside the input; `multiple` shows removable tags. Flat `options` or grouped `optionGroups` (groups win when both are set). Sizes `sm`/`md`/`lg`; `width="content"` hugs the value instead of filling the container.

- Value: `value` + `onValueChange` (controlled) or an initial `value`. Single mode: one option `value` (generic `T`, default `unknown`); `multiple`: an array. Options are `{ value, label }`.
- The list filters by the typed text. `query` (binding-only prop, internal in Angular) seeds/controls it.
- **The panel owns its own open state — there is no `open` prop.** Typing or focusing opens it, and it is a CDK overlay PORTALED to `document.body`, so it floats rather than flowing inside the host. `onOpened` fires when it opens; nothing shows it open in a static card.
- `allowCreate` appends a "Create «text»" row when the text matches no option label — picking it fires `onCreate(text)` and clears the query.
- `loading`: with no options, the list shows three placeholder rows; with options, the rows stay under a `ds-loading-overlay` until it clears.
- `invalid` + `hint` for validation text; Backspace in an empty input removes the last tag in `multiple` mode.

```tsx
<Autocomplete
  placeholder="Search depots"
  options={[
    { value: 'bhx', label: 'Birmingham Hub' },
    { value: 'man', label: 'Manchester Central' },
  ]}
  value={depot}
  onValueChange={setDepot}
/>
```
