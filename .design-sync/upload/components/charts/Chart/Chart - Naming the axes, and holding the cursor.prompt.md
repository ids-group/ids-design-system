# Chart container - naming the axes, and holding the cursor

axisLabel and secondaryAxisLabel name the unit each set of ticks counts, rotated down its own gutter. maxSecondary pins the second axis's ceiling the way max pins the first, so two plots read against each other do not rescale under one another. A press holds the category cursor where it is, by default, with a pin disc at the foot of its band: press again, Escape, or a press outside the plot to let go. Set pinOnClick="false" to keep it moving with the pointer. While the cursor is held the chart draws an Unpin pill on its caption's line, or without a caption over the top end of the plot, as the preset charts do; cursorPinned() and releaseCursor() read and release the pin from code of your own.

Without the category cursor, the pointer on a category's label on the axis answers for its column exactly as the column does: its tooltip opens, and the rest dim only under dimOthers.

Full API: `Chart.d.ts`. How to use the component anywhere: `Chart.prompt.md`.
