---
category: Overlays
---
Centered dialog over a scrim — port of `ds-modal`. Renders INLINE (no portal): the `.modal-backdrop` scrim is `position: fixed; inset: 0`, so it covers the whole viewport unless an ancestor forms a containing block (`transform`, `filter` or `contain`) — for contained specimens either wrap it in one, or set `staticPreview` (the DS's own docs mechanism) to render the bare card in normal flow with no scrim.

- `open` defaults to **true** (Angular defaults to false) so the dialog shows statically; controlled via `onOpenChange`, or leave uncontrolled and it manages itself. With `staticPreview` the card renders regardless of `open`.
- `size`: `'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'` (default `'md'`) — 480 / 640 / 800 / 1024 px / near-viewport.
- `title` is required (header + `aria-labelledby`); `error: true` colours the title for danger confirmations.
- Slots: `children` = body, `actions` = footer buttons (right-aligned; the footer strip renders even when empty), `impact` = affected-records block under the body (hidden when empty; put a `<ul className="list">` in it for the DS styling).
- Dismissal: scrim click (off unless `closeOnBackdrop`, default true), Escape while focus is inside, and the header × — all fire `onClosed` immediately (no leave animation inline). `persistent: true` disables scrim + Escape, leaving only the × / programmatic close.
- Not reproduced from Angular: focus trap, body scroll lock, enter/leave animations, and the `confirmed` output (which Angular never emits itself — call your own handler from your confirm button).

```tsx
<Modal title="Reassign driver?" size="sm" open={open} onOpenChange={setOpen}
  actions={<>
    <Button color="neutral" variant="outline" onPressed={() => setOpen(false)}>Cancel</Button>
    <Button onPressed={reassign}>Reassign</Button>
  </>}>
  Move shipment #48211 from Amelia Barnes to the Leeds depot pool?
</Modal>
```
