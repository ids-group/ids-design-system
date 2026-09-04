# Toast - with action

Pass action: label, handler to ToastService.show() to render a trailing action button (e.g. Undo). An action toast does not auto-dismiss and is always dismissible: the button is the only way to take the action, and the region is the last child of body, so a keyboard user cannot cross a page to reach it inside five seconds.

Full API: `Toast.d.ts`. How to use the component anywhere: `Toast.prompt.md`.
