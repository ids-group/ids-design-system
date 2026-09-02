---
category: Data display
---
Term/detail pairs — a flex column of `DescriptionItem` rows for read-only record details (shipment metadata, account fields).

- `orientation`: `'horizontal'` (default — fixed-width label column beside the value) | `'stacked'` (label above value). Items derive their layout from the list automatically via context.
- Label column width and gaps are themeable: `--ds-description-list-label-w`, `--ds-description-list-row-gap`, `--ds-description-list-col-gap`.
- Children must be `DescriptionItem` elements.

```tsx
<DescriptionList>
  <DescriptionItem term="Consignment">CNS-448-2091</DescriptionItem>
  <DescriptionItem term="Destination">EC1A 1BB, London</DescriptionItem>
</DescriptionList>
```
