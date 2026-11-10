# ChatThread

The scrolling list of a chat (`ds-chat-thread`): its only expected children are `ChatMessage` elements. It follows new messages while the reader is at the end, keeps their place when they scroll up, and offers a jump button back to the latest.

- `working` shows a spinner row at the end; `workingLabel` is the current step ("Rebuilding").
- `foldStepsOnSend` (default true): a new user message folds the steps of the replies before it into a chip.
- `timeBreakMinutes` (default 15): a gap this long between two messages' `sentAt` starts a section with a time divider.
- `hasOlder` and `loadingOlder` with `onLoadOlder` page in earlier messages when the reader scrolls near the start.
- `ariaLabel` names the scroll area.

```tsx
<ChatThread working={busy} workingLabel="Rebuilding">
  <ChatMessage role="user">Make the header blue.</ChatMessage>
  <ChatMessage
    steps={<ChatSteps>
      <ChatStep heading="Reading the page" status="done" />
      <ChatStep heading="Editing the header" status="done" />
    </ChatSteps>}>
    Done: the header is blue now.
  </ChatMessage>
</ChatThread>
```
