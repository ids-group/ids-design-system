# Stats - a formatted number, through Angular's own pipe

value takes string | number | null, so the number, percent and date pipes bind directly — they are typed string | null, and before the null they failed strictTemplates with TS2322. Prefer this to toLocaleString('en-US') in the template, which pins a locale instead of reading LOCALE_ID and re-runs on every change-detection pass where a pure pipe is cached. These four tiles are the proof: the section compiles under strictTemplates.

Full API: `Stat.d.ts`. How to use the component anywhere: `Stat.prompt.md`.
