# MenuItem

Single menu entry — port of `ds-menu-item`. Compose inside `Menu`. The host is `role="none"`; the inner button carries `role="menuitem"`.

- `icon: IconName` renders a leading 16px icon; without it an empty `.menu-item-icon` span keeps labels aligned (fill it via `iconSlot` for custom visuals).
- `error: true` = destructive styling (red label). `disabled` greys out and blocks `onPressed`.
- `onPressed` fires on click. Selecting does NOT auto-close a containing `Popover` (Angular does this via DI) — close it yourself in the handler.
- `submenu` accepts nested content (typically `<Popover><Menu>…</Menu></Popover>`); it renders INLINE beside the item when `submenuOpen` is true (or after click/ArrowRight when uncontrolled) and adds the trailing chevron + `aria-haspopup`.
- `tabbable={false}` takes the item out of the Tab order (roving tabindex — keep one item tabbable per menu).

```tsx
<MenuItem icon="download" onPressed={() => exportPod('PDF')}>Download POD</MenuItem>
```
