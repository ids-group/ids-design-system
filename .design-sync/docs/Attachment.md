---
category: Data display
---
A file attached to a message (`ds-attachment`): a type tile, or the image itself, then the file name and a second muted line. Place it in the `chips` slot of `ChatInput`, before the message is sent.

- `name` is required: the first line, the image's alt text and part of the remove button's name ("Remove report.pdf").
- `meta` is the second line, already formatted (`'PDF · 240 KB'`).
- `kind`: `'pdf' | 'doc' | 'image' | 'file'` (default `'file'`) picks the tile (PDF red, DOC blue, others neutral) and is announced before `meta`. With `kind="image"` and `previewUrl` the image replaces the tile.
- `removable` shows an × button that fires `onRemoved`; removing the file from the list is the app's job.

```tsx
<ChatInput placeholder="Ask about this shipment"
  chips={<>
    <Attachment name="manifest.pdf" kind="pdf" meta="PDF · 240 KB" removable onRemoved={removeManifest} />
    <Attachment name="dock.jpg" kind="image" previewUrl="/img/dock.jpg" meta="JPG · 1.2 MB" removable onRemoved={removePhoto} />
  </>} />
```
