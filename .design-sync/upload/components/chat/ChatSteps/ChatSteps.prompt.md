# ChatSteps

An agent's steps for a chat reply (`ds-chat-steps`): a compact list of `ChatStep` children, drawn on the thread's surface above the reply's bubble. Its only expected children are `ChatStep` elements; the connector between markers is drawn by the steps.

- `enter`: `'together'` (default) grows steps that arrive at once, such as a plan given up front, in as one block; `'stagger'` brings them in one after another.
- Inside a chat message it goes in the `steps` slot; there the message can fold the steps into a chip that shows their count and any failed count.

```tsx
<ChatSteps>
  <ChatStep heading="Read the shipments table" status="done" time="2s" />
  <ChatStep heading="Find late deliveries" status="running" />
  <ChatStep heading="Draft the summary" status="pending" />
</ChatSteps>
```
