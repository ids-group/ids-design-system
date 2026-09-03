# Filter bar - sizing the "+N" trigger

triggerSize matches the trigger to the filters beside it — default md. The bar cannot work this out on its own: dsFilterItem carries a WIDTH, and the filters are arbitrary projected controls whose own size it never sees. Left unset beside sm filters, the trigger stands 8px taller than everything next to it, since the row aligns on flex-end.

Full API: `FilterBar.d.ts`. How to use the component anywhere: `FilterBar.prompt.md`.
