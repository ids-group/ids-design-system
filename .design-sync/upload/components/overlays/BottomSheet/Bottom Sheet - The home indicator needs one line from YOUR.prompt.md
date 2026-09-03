# Bottom sheet - the home indicator needs one line from YOUR app

The sheet pads its bottom by env(safe-area-inset-bottom) so its last action does not sit under the home indicator. That inset reads 0 until the host document opts in, and a library cannot do it for you — it lives in the viewport meta tag of your index.html. Same requirement as ds-auth-layout, where it is spelled out.

Full API: `BottomSheet.d.ts`. How to use the component anywhere: `BottomSheet.prompt.md`.
