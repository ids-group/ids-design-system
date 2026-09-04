# Autocomplete - object values keep their selection

compareWith decides when two values are the same one. The default is ===, which for an object is reference identity — so a re-fetch returning equal data as new objects would drop the selection. Key the comparator on whatever identifies the value. Press Refetch: the selection survives.

Selected:

Full API: `Autocomplete.d.ts`. How to use the component anywhere: `Autocomplete.prompt.md`.
