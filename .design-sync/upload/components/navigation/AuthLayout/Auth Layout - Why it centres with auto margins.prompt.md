# Auth layout - why it centres with auto margins

The full-height box is the layout's own host, and there is only one of it — the hand-rolled version this replaces nested a 100vh wrapper inside a 100dvh one, which scrolls a page whose content fits. Inside it the column is centred with auto margins rather than centre alignment. On a normal page the two are the same, because the host is free to grow and a tall form simply lengthens it. They differ once the host cannot grow — when you embed the layout by setting its min-height token to 100% in a fixed-height parent. There, centre alignment puts a form taller than the box above the scroll origin, out of reach of any scrolling; auto margins collapse to zero instead, so the form pins to the top padding edge and scrolls from there. Both demos above are the real component with that token lowered to fit this page.

Full API: `AuthLayout.d.ts`. How to use the component anywhere: `AuthLayout.prompt.md`.
