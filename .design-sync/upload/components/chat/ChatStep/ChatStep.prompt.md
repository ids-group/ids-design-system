# ChatStep

One step of an agent's work (`ds-chat-step`): a 16px marker on a connector beside a heading, at the smaller text size. Use as a child of `ChatSteps`.

- `status`: `'done'` (check on a success disc), `'running'` (spinner), `'pending'` (dashed ring, muted heading), `'waiting'` (grey disc with a pause glyph), `'error'` (cross on an error disc). It is spoken before the heading ("Waiting for your approval: Publish").
- `heading` is the step's line; `time` (already formatted) sits muted under the step's content.
- `children` sit under the heading. A `waiting` step holds the reader's answer there, such as Approve and Decline buttons, and keeps its marker beside the heading.
- Slots: `trailing` sits at the end of the heading row (Stop, Retry); `details` (the step's log) hides behind a chevron at the end of that row.
- `expanded` / `onExpandedChange`: whether `details` is open (closed by default).

```tsx
<ChatSteps>
  <ChatStep heading="Prepare the export" status="done" />
  <ChatStep heading="Publish to the client portal" status="waiting">
    <Button size="sm" onPressed={approve}>Approve</Button>
  </ChatStep>
  <ChatStep heading="Notify the account team" status="error"
    trailing={<Button size="sm" variant="outline" color="neutral" onPressed={retry}>Retry</Button>}
    details={<pre>SMTP 421: try again later</pre>} />
</ChatSteps>
```
