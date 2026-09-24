# Auth layout - on a short screen the chrome compresses, not the card

A landscape phone leaves about 330px of viewport, and the furniture this layout puts around your card — block padding, the column gap, the letter-mark tile, the wordmark, the masthead's inner gap — used to cost ~219px of that before your form got a single pixel. All of it now clamps against svh, so at ~330px the same chrome costs ~131px. Every multiplier reaches its maximum at a viewport 800px tall or more — which is a viewport height, not a screen size: a 1366x768 laptop lands near 630px after browser and OS chrome, and a 1080p screen at 150% display scaling near 585px, so plenty of desktops render the compressed furniture too. Type is deliberately not part of it: the wordmark and the tile's glyph stay fixed, because in a row whose height the tile already sets they cost nothing to shrink and only flatten the brand against the tagline.

The demos above cannot show it: the clamps read the real VIEWPORT, and a framed demo only shrinks its own box. Make the browser window short — or rotate a phone — and watch the padding, the gap and the wordmark come down together.

svh and not dvh: the dynamic unit changes as a mobile URL bar hides, which would resize the wordmark and re-space the column while the reader scrolls. Setting any of --ds-auth-layout-padding-block, -gap or -mark-size to a fixed value opts out of the compression for that one dimension.

What this does not promise. A card taller than the space left still scrolls, and should — the fix is for the LAYOUT never to be the reason. Compressing rather than pinning is deliberate: the same exercise elsewhere takes the masthead and footer out of the flow with position: absolute, which frees more room but lets that chrome overlap a tall form instead of scrolling past it. A card here holds whatever you project into it, so overlap is the worse failure.

Full API: `AuthLayout.d.ts`. How to use the component anywhere: `AuthLayout.prompt.md`.
