# Chart container - naming the axes, and holding the cursor

axisLabel and secondaryAxisLabel name each axis's unit, rotated down its gutter. maxSecondary pins the second axis's ceiling as max pins the first, so compared plots do not rescale. A press holds the category cursor, with a pin disc at the band's foot; press again, Escape or a press outside releases. pinOnClick="false" keeps it following the pointer. While held, an Unpin pill sits on the caption line, or atop the plot without one; cursorPinned() and releaseCursor() read and release the pin from your code.

Without the cursor, hovering an axis label acts as hovering its column: the tooltip opens; the rest dim only under dimOthers.

Full API: `Chart.d.ts`. How to use the component anywhere: `Chart.prompt.md`.
