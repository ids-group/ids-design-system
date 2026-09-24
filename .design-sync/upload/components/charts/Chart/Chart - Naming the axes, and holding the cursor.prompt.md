# Chart container - naming the axes, and holding the cursor

axisLabel and secondaryAxisLabel name the unit each set of ticks counts, rotated down its own gutter. maxSecondary pins the second axis's ceiling the way max pins the first, so two plots read against each other do not rescale under one another. cursorPin holds the category cursor where it is: press once to hold, press again, Escape, or a press outside to let go.

Full API: `Chart.d.ts`. How to use the component anywhere: `Chart.prompt.md`.
