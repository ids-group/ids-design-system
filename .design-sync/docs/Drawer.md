---
category: Overlays
---
Edge-anchored slide-in panel for inline edit flows — port of `ds-drawer`. Renders INLINE (no portal): `.drawer-root` is `position: fixed; inset: 0` (scrim + panel absolutely positioned inside it), so it covers the viewport unless an ancestor forms a containing block (`transform`, `filter` or `contain`) — wrap contained specimens in one sized like a mini viewport. Unlike Modal there is no `staticPreview` branch.

- `open` defaults to **true** (Angular defaults to false) so the panel shows statically; controlled via `onOpenChange`, or leave uncontrolled.
- `placement`: `'right' | 'left' | 'top' | 'bottom'` (default `'right'`). Right/left use the width tokens; top/bottom span full width at up to 80vh.
- `size`: `'sm' | 'md' | 'lg'` (default `'md'`) — 320 / 480 / 640 px wide, right/left placements only.
- `title` required (header + `aria-labelledby`). Header always includes the × close button.
- Slots: `children` = body (`[drawer-body]`), `footer` = right-aligned action buttons (`[drawer-footer]`; the footer strip renders even when empty — same as Angular).
- Dismissal: scrim click, the ×, or Escape while focus is inside — all fire `onClosed` immediately (no slide-out inline). Focus trap, body scroll lock and document-level Escape are not reproduced.
- Prefer a drawer over a modal when the form needs more vertical room or runs alongside the underlying page state.

```tsx
<Drawer title="Edit collection" placement="right" size="md" open={open} onOpenChange={setOpen}
  footer={<>
    <Button color="neutral" variant="outline" onPressed={() => setOpen(false)}>Cancel</Button>
    <Button onPressed={save}>Save</Button>
  </>}>
  <Input label="Collection point" value="Depot 12, Carlisle CA3 8XN" />
</Drawer>
```
