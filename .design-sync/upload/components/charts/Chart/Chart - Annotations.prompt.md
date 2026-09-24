# Chart container - annotations

dsSeriesAnnotation pins a label to one reading, so the point it names is legible with no pointer - in a printed page, or a screenshot. It takes the readings rather than finding them: a mark never sees the other marks, so the caller that owns the series is the one that knows which value a label belongs to. It reports no domain, because the series it annotates already did.

Full API: `Chart.d.ts`. How to use the component anywhere: `Chart.prompt.md`.
