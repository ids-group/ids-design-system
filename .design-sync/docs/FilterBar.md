---
category: Data display
---
The filter row above a table or list. Visible filters sit inline; the rest collapse into a "More" popover when the row runs out of width.

- Children are the filter controls (Select, MultiSelect, Autocomplete, DatePicker). Anything that carries neither a slot attribute nor a filter control is dropped — the bar projects by attribute, not by position.
- `dsFilterBarTrailing` slot pins content to the right of the row: a reset link, a saved-view menu, a result count.
- `moreLabel` names the overflow trigger, `panelLabel` labels its popover for screen readers, `triggerSize` matches the trigger to the filters' own size.
- The bar owns the overflow, not the layout: put it directly above the data it filters, full width, with no extra wrapper that could clip the popover.

```tsx
<FilterBar moreLabel="More filters" triggerSize="sm">
  <Select options={depots} value={depot} placeholder="Depot" />
  <DatePicker value={from} placeholder="From" />
  <span dsFilterBarTrailing=""><Button variant="ghost" size="sm">Reset</Button></span>
</FilterBar>
```
