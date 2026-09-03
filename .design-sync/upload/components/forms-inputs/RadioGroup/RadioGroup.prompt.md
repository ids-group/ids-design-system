# RadioGroup

Single-select wrapper for `Radio` options — renders as `role="radiogroup"` with an optional visible `label` above and a `hint` below. Supplies every child `Radio` with a shared `name`, the current selection and the group `disabled` state; arrow keys move the selection between enabled options.

- Selection: pass `value` + `onValueChange` (controlled) or just an initial `value`; it is matched against each `Radio`'s `value` with `===`.
- `name` defaults to a generated unique id — set it only when the group posts in a native form.
- `invalid` styles the group + sets `aria-invalid`; error text goes in `hint`. No visible `label`? Set `ariaLabel`.
- Children are the `Radio` elements (layout wrappers between them are fine).

```tsx
<RadioGroup label="Service level" value={service} onValueChange={setService}>
  <Radio value="economy" label="Economy (3–5 days)" />
  <Radio value="next-day" label="Next day" />
  <Radio value="timed" label="Timed AM" disabled />
</RadioGroup>
```
