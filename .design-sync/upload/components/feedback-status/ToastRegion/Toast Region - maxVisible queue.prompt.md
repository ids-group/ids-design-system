# Toast Region - maxVisible queue

Set toast.maxVisible through provideDsConfig to cap concurrent toasts. Extras queue and appear as earlier ones dismiss. A region shows maxVisible at once, five by default — fire the button below twice and the sixth onwards wait their turn. Change it there, or pass 0 for no cap at all.

Full API: `ToastRegion.d.ts`. How to use the component anywhere: `ToastRegion.prompt.md`.
