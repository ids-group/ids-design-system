---
category: Feedback & status
---
Vertical stack of toasts — port of `ds-toast-region`. Data-driven: pass `toasts` (the Angular ToastService's entries) and it renders a `Toast` per entry, oldest first, inside a labelled `role="region"`.

- `toasts: ToastEntry[]` — `{ id, body, variant, dismissible, title?, action? }`.
- `onClosed(id)` fires when a toast is dismissed or its action runs — remove that entry from `toasts`.
- `maxVisible` caps how many render (0 = unlimited, default). Extras are simply not shown (Angular queues them).
- Renders INLINE where placed (Angular portals it to a viewport corner). To pin it, wrap it yourself: `position: fixed; top: 16px; right: 16px; z-index: var(--layer-toast)`.

```tsx
<ToastRegion
  toasts={[
    { id: 1, variant: 'success', body: 'POD uploaded for order #48211.', dismissible: true },
    { id: 2, variant: 'error', body: 'Depot sync failed — retrying.', dismissible: true },
  ]}
  onClosed={removeToast}
/>
```
