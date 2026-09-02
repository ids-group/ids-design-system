---
category: Overlays
---
Confirmation dialog — port of `ds-modal-confirm`, the card that `ModalService.confirm(options)` raises in Angular. Props flatten `ModalConfirmOptions` 1:1 and `onResolved(boolean)` mirrors the service's promise. Renders the `alertdialog` card only, in normal flow — in Angular the service supplies the centred CDK overlay + scrim around it (wrap in your own scrim or a containing block if you need that look).

- `title` required; `message` renders as the body paragraph and wires `aria-describedby`.
- `tone: 'error'` = danger confirmation: red title styling and an error-coloured confirm button. `icon` adds the header icon badge.
- `confirmLabel` / `cancelLabel` default to `'Confirm'` / `'Cancel'`. Cancel resolves `false`, confirm resolves `true` via `onResolved`.
- `typeToConfirm="phrase"` keeps the confirm button disabled until the user types the exact phrase (live/interactive in this binding) — the guard for high-stakes destructive actions.
- No close ×, no backdrop dismissal inline (the Angular service resolves `false` on scrim click / Escape).

```tsx
<ModalConfirm
  title="Delete Project Alpha?"
  message="All 24 logistics plans and their allocations will be removed."
  tone="error"
  confirmLabel="Delete project"
  typeToConfirm="Project Alpha"
  onResolved={(ok) => ok && deleteProject()}
/>
```
