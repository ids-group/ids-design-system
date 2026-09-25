# Chart container - naming the axes, and holding the cursor

axisLabel and secondaryAxisLabel name the unit each set of ticks counts, rotated down its own gutter. maxSecondary pins the second axis's ceiling the way max pins the first, so two plots read against each other do not rescale under one another. A press holds the category cursor where it is, by default, with a pin disc at the foot of its band: press again, Escape, or a press outside or between two bands to let go. Set cursorPin="false" to keep it moving with the pointer. A composed chart draws no Unpin control; cursorPinned() and releaseCursor() let you render your own.

Without the category cursor, resting the pointer on a category's label on the axis answers for its column: the column's tooltip opens and every other column dims, whatever dimOthers says, the way a legend entry singles out its series.

Full API: `Chart.d.ts`. How to use the component anywhere: `Chart.prompt.md`.
