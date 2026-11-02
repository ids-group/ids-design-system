---
category: Forms & inputs
---
Message box for a chat or an instruction (`ds-chat-input`): an auto-growing text area in a bordered frame with a send button. Enter sends, Shift+Enter breaks the line.

- `value` / `onValueChange`: the text. It is NOT cleared on send; clear it yourself once the message is accepted.
- `onSubmitted` fires with the trimmed text on Enter or the send button. Blank text, `busy`, `disabled` and an Enter that commits an IME composition never send.
- `minRows` (default 1) and `maxRows` (default 8) bound the height; past `maxRows` the text scrolls.
- `busy` shows a spinner on the send button and refuses sending while the text stays editable; `busyLabel` is the step shown beside it ("Searching orders…").
- `layout`: `'status-bar'` (default: 32px square send button, step beside it), `'status-above'` (step on a line above the box), `'split'` (attach outside left, send outside right, step above), `'send-outside'` (round 40px send button outside right), `'toolbar'` (attach, step and send in a row under the box).
- Slots: `attachments` sits above the frame on the page (a picked element with its snapshot), `chips` above the text inside the frame (`Attachment`s), `actions` on the left of the bottom bar (an attach `IconButton`), `send` replaces the default send button.
- `onFilesPasted` fires with the image files of a paste, which then inserts no text.
- `placeholder`, `ariaLabel` (falls back to "Message"), `disabled`.

```tsx
<ChatInput value={draft} onValueChange={setDraft} placeholder="Ask about this shipment"
  busy={working} busyLabel="Searching orders…"
  onSubmitted={(text) => { send(text); setDraft(''); }}
  actions={<IconButton icon="paperclip" ariaLabel="Attach a file" variant="ghost" size="sm" />} />
```
