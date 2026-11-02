---
category: Data display
---
What a sent message was about (`ds-chat-attachment`): a pill chip in a chat message's attachments row with a label and the page it came from. Clicked, it opens into a card on its own line that frames `children`, such as a snapshot of the picked element.

- `label` is required; `source` (optional) is the page it was picked on, shown muted after it.
- `icon` defaults to `paperclip`; pass another icon name, or `null` for none.
- `expanded` / `onExpandedChange`: the open state. Closed, the snapshot is hidden; open, it is shown at most `--ds-chat-attachment-preview-max-height` (16rem) tall.
- For a plain file with nothing to preview, use a `Tag`.

```tsx
<ChatAttachment label="Shipments table" source="Orders · Today" icon="table">
  <img src="/snapshots/shipments-table.png" alt="" />
</ChatAttachment>
```
