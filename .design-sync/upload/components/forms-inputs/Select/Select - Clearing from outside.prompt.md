# Select - clearing from outside

clear() empties the value from a template reference — a "reset filters" button, a form the app clears itself. All three pickers have it now; ds-autocomplete was the only one before, so an app with its own reset had to write the empty value by hand and guess what empty means for each control. It deliberately does not move focus.

Full API: `Select.d.ts`. How to use the component anywhere: `Select.prompt.md`.
