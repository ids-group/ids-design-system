// The custom-property readers shared by the token reference generator (tools/extract-tokens.mjs)
// and the default-value diff (tools/token-diff.mjs), so both read a `var()` and a comment the same
// way.

/** Parses one `var(…)` from the index of its "v". Counts parens, so a fallback that
 *  nests further `var()` or `calc()` calls is returned whole. */
export function parseVarCall(text, varIndex) {
  const open = text.indexOf('(', varIndex);
  let depth = 0;
  let i = open;
  for (; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')') {
      depth--;
      if (depth === 0) break;
    }
  }
  const inner = text.slice(open + 1, i); // "--ds-x, <fallback>"
  const comma = inner.indexOf(',');
  const name = (comma === -1 ? inner : inner.slice(0, comma)).trim();
  const fallback = comma === -1 ? '' : inner.slice(comma + 1).trim();
  return { name, fallback, endIndex: i + 1 };
}

// A comment that shows how to set a token — `--ds-chart-frame-padding: 0` — is otherwise read as a
// declaration of it, and since the match runs to the first `;` it swallows the real declaration
// underneath and publishes one token holding the other's value.
export function withoutComments(scssText) {
  return scssText
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/[^\n]*/g, '$1');
}
