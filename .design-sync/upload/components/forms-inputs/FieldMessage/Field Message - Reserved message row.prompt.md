# Field Message - reserved message row

reserveMessage (default off) holds a message line's height even when there's no hint or error, so a form doesn't reflow the moment validation appears. Turn it on with [reserveMessage]="true" on a single control, or with the dsReserveMessages directive for a whole form (below). The reserved row sits ~23px under the control, so stack reserved fields tighter — <ds-stack gap="none"> — than bare ones, or the gap reads as a hole.

For a whole form, put the dsReserveMessages directive on it instead of binding every control: <form dsReserveMessages>…</form>. It provides DS_CONFIG for its subtree, merged with the config above it, and a field's own [reserveMessage] still wins. It applies to fields declared inside the host — projected content keeps the injector of the template it was written in.

Full API: `FieldMessage.d.ts`. How to use the component anywhere: `FieldMessage.prompt.md`. This component is not exported by the package, so it has neither.
