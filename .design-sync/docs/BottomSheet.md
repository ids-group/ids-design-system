---
category: Overlays
---
Bottom-anchored sheet, the mobile sibling of Drawer — port of `ds-bottom-sheet`. Renders INLINE (no portal): `.sheet-overlay` is the scrim itself at `position: fixed; inset: 0` (flex, panel pushed to the bottom edge), so it covers the viewport unless an ancestor forms a containing block (`transform`, `filter` or `contain`) — wrap contained specimens in one sized like a mini viewport. On wide viewports the panel caps at `--ds-bottom-sheet-maxw` (480px) and centres.

- `open` defaults to **true** (Angular defaults to false) so the sheet shows statically; controlled via `onOpenChange`, or leave uncontrolled.
- `title` required — header text under the grab strip, wired to `aria-labelledby`.
- Slots: `children` = scrollable body; `actions` = footer buttons stacked **vertically** full-width (pair with `fullWidth` buttons).
- `snapPoints={[0.35, 0.9]}` (fractions of viewport height, ascending) pins the sheet height to a stop; `activeSnapIndex` (binding-only, default 0) picks which stop renders — in Angular the index changes by dragging, which is not reproduced inline.
- The grab strip + handle render, but drag-to-dismiss/snap is not reproduced. Scrim tap and Escape (focus inside) close and fire `onClosed` immediately. Focus trap, body scroll lock and slide animations are not reproduced.
- Prefer `Modal` / `Drawer` for desktop-first layouts.

```tsx
<BottomSheet title="Edit registration" open={open} onOpenChange={setOpen}
  actions={<>
    <Button fullWidth onPressed={save}>Save</Button>
    <Button fullWidth color="neutral" variant="outline" onPressed={() => setOpen(false)}>Cancel</Button>
  </>}>
  <p>Update the vehicle registration for trailer MAN-4419. Changes apply to this event only.</p>
</BottomSheet>
```
