# Chart container - category cursor

cursor="category" draws a band and a crosshair down the category under the pointer, and reports that category to every mark through the shared scales. The default, cursor="auto", turns it on for a plot of two or more marks that show a tooltip, whose panel then names every mark's reading at the category wherever in it the pointer is. A plot of one mark stays off: its marks are themselves the hover targets and already answer per mark, and two affordances on one plot read as two different questions. A mark set to tooltip="axis" reads that same category and names every series at it.

Full API: `Chart.d.ts`. How to use the component anywhere: `Chart.prompt.md`.
