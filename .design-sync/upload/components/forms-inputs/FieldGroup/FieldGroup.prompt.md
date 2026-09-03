# FieldGroup

Joins adjacent form controls into one visual field — a select beside an input, a prefix button before a search. The controls keep their own behaviour; only the box is shared.

- Children are the controls, in order. The group flattens the inner corners and collapses the doubled border between them.
- `size` must match the children's own size, or the seam shows: pass the same `DsSize` to the group and to every control.
- `invalid` and `disabled` paint the whole group, so the joined field reads as one control. Still set `disabled` on each child that must not accept input — the group styles, it does not gate.
- `fullWidth` stretches the group; without it the group shrink-wraps its content.

```tsx
<FieldGroup size="md" fullWidth>
  <Select size="md" options={countryCodes} value={code} />
  <Input size="md" placeholder="Phone number" />
</FieldGroup>
```
