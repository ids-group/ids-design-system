# Chart container - composing a chart

A mark is an ATTRIBUTE on a real <svg:g> - dsColumnSeries, dsLineSeries, dsReferenceLine, dsReferenceLabel - because an element the SVG specification does not know renders nothing and neither do its children. The svg: prefix is Angular's, and a projected SVG element without it is rejected at compile time.

The container has three slots and they are layers rather than an ordering preference: a reference line paints UNDER the marks whatever order you wrote it in, the default slot takes the marks, and a reference label paints OVER them, so an annotation's stroke stays furniture and its name survives a column drawn through it. Inside the default slot the marks paint in the order they are written.

This one is a column series with a target band behind it and the band's names over it. ds-column-chart wraps exactly this arrangement behind its own thresholds input; written out, that input is what it builds.

Full API: `Chart.d.ts`. How to use the component anywhere: `Chart.prompt.md`.
