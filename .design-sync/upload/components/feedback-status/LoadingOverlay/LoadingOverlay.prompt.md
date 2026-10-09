# LoadingOverlay

Region-scoped loading scrim. Wrap the region's content as children; while `loading` is true a translucent scrim with a centred Spinner covers it (rendered inline and absolutely positioned over the children — no portal). The host is `position: relative; display: block` and gets `aria-busy="true"` while loading.

- `loading` (default false) toggles the scrim; children stay mounted underneath.
- `label` adds a caption under the spinner (e.g. `"Loading shipments…"`).
- `blur` (default true) backdrop-blurs the covered content.
- `spinnerSize`: sm | md | lg (default md) — match the region's size.
- `insetTop` (CSS length, default `'0'`) lowers the scrim's top edge so a sticky header stays uncovered.
- `--ds-loading-overlay-radius` (default `0`): the scrim's corner radius; set it to the covered container's radius.
- The wrapped region must have its own height — an empty region gives the scrim nothing to cover. For placeholder content use EmptyState (which embeds this component for its loading variant).

```tsx
<LoadingOverlay loading label="Loading shipments…">
  <ShipmentTable rows={rows} />
</LoadingOverlay>
```
