# Colour - a clipping ancestor eats the ring — data-focus="inset" is the answer

Every style above draws OUTSIDE the border box, so an ancestor with overflow: hidden cuts the indicator away and leaves the element focusable with nothing to see. That ancestor is not exotic: clipping a card is how a full-bleed child stays inside a rounded corner, and ds-card with padding="none" invites it. inset draws the same two rings INSIDE the box instead, where nothing can clip them.

It is the one style not pinned to <html>. A clip is local, so put the attribute on the clipping element and the two roles inherit into everything below it — Tab into both wells to see it. Setting it brand-wide would move every ring inside its control, which is a different look, not a fix.
