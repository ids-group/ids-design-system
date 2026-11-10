# Splitter

Two panes with a handle between them that resizes one of them (`ds-splitter`). Give it a height, a fixed one or from a flex or grid parent; the panes fill it.

- Slots: `start` and `end`, the two panes.
- `orientation`: `'horizontal'` (side by side, default) or `'vertical'` (stacked).
- `pane`: `'start'` (default) or `'end'`, the pane `size` measures; the other one takes the rest.
- `size` / `onSizeChange`: that pane's size in px, written once when a drag ends. `null` shows `defaultSize` (320).
- `min` (160) and `max` (640) bound it. Dragged past a limit the handle stretches with resistance and springs back; `overdrag="none"` stops it at the limit instead.
- Keyboard: arrows move 16px, Shift+arrow or PageUp / PageDown 64px, Home / End to the limits; a double click returns to `defaultSize`.
- `persistKey` keeps the size in `localStorage`; `ariaLabel` names the handle (falls back to "Resize panes").

```tsx
<Splitter style={{ height: 480 }} defaultSize={280} min={200} max={420}
  start={<Tree nodes={depots} />}
  end={<Table data={rows} columns={columns} />} />
```
