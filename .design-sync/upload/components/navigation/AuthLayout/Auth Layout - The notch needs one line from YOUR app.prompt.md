# Auth layout - the notch needs one line from YOUR app

This layout pads itself by env(safe-area-inset-*), so a notched phone in landscape does not put the card under the cutout — and ds-bottom-sheet does the same for the home indicator. Those insets are 0 until the host document opts in, and a library cannot do it for you: it lives in the viewport meta tag, which belongs to your index.html.

Without it a cutout is not enough — the browser simply reports 0 for every inset and the padding you see is the plain one. This site sets it, so the behaviour above is the real thing rather than a description of it.

Full API: `AuthLayout.d.ts`. How to use the component anywhere: `AuthLayout.prompt.md`.
