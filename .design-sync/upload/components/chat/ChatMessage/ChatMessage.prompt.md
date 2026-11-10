# ChatMessage

One message of a chat (`ds-chat-message`), placed inside a `ChatThread`. The text is its content.

- `role`: `'assistant'` (default) is a subtle bubble on the left, `'user'` a filled bubble on the right, `'system'` a notice from the app, centred between replies.
- A `'system'` notice takes `tone`: `'neutral'` (default) is a quiet one-line plaque for a routine note; `'info'`, `'success'`, `'warning'` and `'error'` draw a card in that status colour with its icon. `title` adds a bold first line, `icon` sets the icon.
- `author` shows a name above the bubble. `time` is a formatted label under it; `sentAt` lets the thread split runs by time and date the divider.
- `streaming` blinks a caret after text that is still arriving and hides `actions` until it is done.
- `status` on a message the reader sent: `'sending'` dims it, `'failed'` says it was not sent and offers Retry (`onRetry`).
- Slots: `steps` goes above the bubble (a `ChatSteps` with `ChatStep`s); `stepsFolded` / `onStepsFoldedChange` fold them into a chip at the top of the bubble. `attachments` sits under the text (`ChatAttachment`s), `actions` under the bubble (copy, retry buttons).

```tsx
<ChatThread>
  <ChatMessage role="user">Make the Sign In button full width.</ChatMessage>
  <ChatMessage role="system">The prototype was rebuilt</ChatMessage>
  <ChatMessage>Done. The button now spans the form.</ChatMessage>
  <ChatMessage role="system" tone="warning">The prototype stopped building.</ChatMessage>
</ChatThread>
```
