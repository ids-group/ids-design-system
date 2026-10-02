# Typography - type ramp

Every size role side-by-side. Headings carry the document hierarchy; a page title is usually .t-h2. Default UI runs on .t-s (14).

Each class reads --ds-typography-<role>-font-weight, -font-size, -line-height, -font-family (and -letter-spacing or -color where it sets them), so one axis retunes in a scope: .my-scope .t-h3 --ds-typography-h3-font-weight: var(--font-weight-bold).
