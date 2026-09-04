# Sidenav - letter-mark & accent wordmark

logoLetter sets the tile glyph when it differs from the brand's first letter, and markup marked dsBrandName projects a custom wordmark in place of the plain brand text — here a two-tone "MyAdmin" whose accent slice matches the tile. Keep the string input alongside as the fallback semantics.

brandRoute makes the brand row a link — normally the app's home. Unset it stays a plain block, because a logo that goes nowhere should not be a link and every app decides for itself whether its mark is a way home. The row announces itself as "<brand>, home"; override that with brandLinkLabel. Router targets only, and RouterLink is instantiated only once the input is set, so an app with no router still renders the sidenav. Not demonstrated live here on purpose: a specimen that navigates takes the page with it.

Full API: `Sidenav.d.ts`. How to use the component anywhere: `Sidenav.prompt.md`.
