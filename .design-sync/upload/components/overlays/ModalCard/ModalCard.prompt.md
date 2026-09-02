# ModalCard

Bare dialog card — port of `ds-modal-card`: the modal surface with header, body, impact and actions but **no scrim or positioning**. It renders in normal flow, which makes it the right choice for static specimens (the DS docs compare sizes side by side exactly this way); `Modal` composes it inside the backdrop for the real dialog.

- `size`: `'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'` (default `'md'`); `title` required; `error: true` for danger styling (red title + red icon badge).
- `showClose` (default true) toggles the header × (fires `onClosed`). Static specimens usually set `showClose={false}`.
- `icon` renders a circular icon badge before the title (accent-tinted; error-tinted with `error`).
- `dialogRole`: `'dialog' | 'alertdialog'` (default `'dialog'`); `ariaDescribedBy` mirrors the host-level `aria-describedby` the confirm dialog uses.
- Slots: `children` = body, `impact` (hidden when empty), `actions` (footer strip renders even when empty — omit-with-border is Angular-faithful).

```tsx
<ModalCard title="Delete depot?" size="sm" error showClose={false}
  actions={<>
    <Button color="neutral" variant="outline">Cancel</Button>
    <Button color="error">Delete</Button>
  </>}>
  Dover depot has 12 open collections. This cannot be undone.
</ModalCard>
```
