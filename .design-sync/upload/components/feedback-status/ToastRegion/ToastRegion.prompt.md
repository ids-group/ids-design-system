# ToastRegion

Vertical stack of toasts. It renders one `Toast` per live entry inside a labelled `role="region"`, newest nearest the anchor, and the service owns what is in it.

- The region takes no content of its own: `ToastService.show()` and `.promise()` feed it from inside the app, and it owns dismissal. A static card therefore cannot populate it.
- `maxVisible` caps how many render (0 = unlimited, default). Extras are simply not shown (Angular queues them).
- Renders INLINE where placed (Angular portals it to a viewport corner). To pin it, wrap it yourself: `position: fixed; top: 16px; right: 16px; z-index: var(--layer-toast)`.

```tsx
// One region per app, near the root. `maxVisible` is its only prop.
<ToastRegion maxVisible={3} />
```

Toasts are raised from the app, not from this element:

```ts
toast.show({ variant: 'success', body: 'POD uploaded for order #48211.' });
toast.promise(save(), { loading: 'Saving…', success: 'Saved', error: 'Save failed' });
```
