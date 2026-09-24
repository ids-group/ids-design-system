# Select - clearing from outside

clear() empties the value from a template reference — a "reset filters" button, a form the app clears itself. All three pickers have it now; ds-autocomplete was the only one before, so an app with its own reset had to write the empty value by hand and guess what empty means for each control. It deliberately does not move focus; where the host moves on after clearing, follow it with blur(), the counterpart of focus() that every field control has. It drops focus from whichever part of the control holds it and leaves an open panel alone.

Full API: `Select.d.ts`. How to use the component anywhere: `Select.prompt.md`.
