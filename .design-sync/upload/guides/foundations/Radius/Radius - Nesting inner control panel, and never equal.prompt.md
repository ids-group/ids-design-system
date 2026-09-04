# Radius - nesting: inner < control < panel, and never equal

A rounded thing inside a rounded thing needs a SMALLER radius, or the inner corner appears to bulge out of the outer one. The two stages below are the same markup with one token changed — the left one is correct, the right one gives the child the parent's radius.

The optical rule when the roles do not cover a value: inner radius = outer radius minus the padding between them. A 12px panel with 8px of padding wants an 8px child. And --radius-flat is a statement, not a zero — it exists so "deliberately square" reads differently from "nobody set a radius", which is what the middle of a button group and an in-range calendar day rely on.
