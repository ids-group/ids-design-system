# Chat Thread - steps fold into the reply

When the reader sends the next message, the steps of the reply before it fold into a chip at the top of that reply; the chip opens them again. A reply with a failed step keeps its steps open. Set [foldStepsOnSend]="false" on the thread to keep them, or bind [(stepsFolded)] on a message to fold it yourself.

Full API: `ChatThread.d.ts`. How to use the component anywhere: `ChatThread.prompt.md`.
