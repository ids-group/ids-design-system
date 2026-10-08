// Pure text scanning, no devkit import, so `tools/check-overrides-selftest.mjs` can exercise it
// directly with `node:assert` instead of a schematic tree.
//
// Both scans work line by line: a `ds-*` selector and the class it dead-styles have to share a
// line to be caught. A class inside a nested SCSS block under `ds-x {` on another line is not
// resolved — documented in README.md alongside the schematic.

export interface WriteOnlyTokenHit {
  token: string;
  line: number;
}

export interface DeadClassHit {
  selector: string;
  className: string;
  line: number;
}

// Comments are stripped per line so a token or selector only mentioned in prose never reports a
// hit; a `/* … */` spanning several lines is tracked across them.
function linesWithoutComments(text: string): string[] {
  let inBlockComment = false;

  return text.split(/\r\n|\n/).map((rawLine) => {
    let line = rawLine;
    if (inBlockComment) {
      const end = line.indexOf('*/');
      if (end === -1) return '';
      line = line.slice(end + 2);
      inBlockComment = false;
    }
    const lineCommentAt = line.indexOf('//');
    if (lineCommentAt !== -1) line = line.slice(0, lineCommentAt);

    let cleaned = '';
    let rest = line;
    for (;;) {
      const blockStart = rest.indexOf('/*');
      if (blockStart === -1) {
        cleaned += rest;
        break;
      }
      cleaned += rest.slice(0, blockStart);
      const blockEnd = rest.indexOf('*/', blockStart + 2);
      if (blockEnd === -1) {
        inBlockComment = true;
        break;
      }
      rest = rest.slice(blockEnd + 2);
    }

    return cleaned;
  });
}

const DECLARED_TOKEN = /(--ds-[a-z0-9-]+)\s*:/g;
// `[style.--ds-x]="…"` in a template, `el.style.setProperty('--ds-x', …)` in code: neither is
// followed by a colon, so a declaration pattern never sees them.
const BOUND_TOKEN = /(?:style\.|setProperty\(\s*['"`])(--ds-[a-z0-9-]+)/g;

export function findWriteOnlyTokens(
  text: string,
  readTokens: ReadonlySet<string>,
): WriteOnlyTokenHit[] {
  return findUnreadTokens(text, readTokens, DECLARED_TOKEN);
}

export function findWriteOnlyBoundTokens(
  text: string,
  readTokens: ReadonlySet<string>,
): WriteOnlyTokenHit[] {
  return findUnreadTokens(text, readTokens, BOUND_TOKEN);
}

function findUnreadTokens(
  text: string,
  readTokens: ReadonlySet<string>,
  pattern: RegExp,
): WriteOnlyTokenHit[] {
  const hits: WriteOnlyTokenHit[] = [];
  linesWithoutComments(text).forEach((line, index) => {
    for (const match of line.matchAll(pattern)) {
      const token = match[1];
      if (!readTokens.has(token)) hits.push({ token, line: index + 1 });
    }
  });

  return hits;
}

export function findDeadClasses(
  text: string,
  classesBySelector: Readonly<Record<string, readonly string[]>>,
): DeadClassHit[] {
  const hits: DeadClassHit[] = [];
  linesWithoutComments(text).forEach((line, index) => {
    for (const match of line.matchAll(/\b(ds-[a-z0-9-]+)\b([^{;,]*)/g)) {
      const selector = match[1];
      const knownClasses = classesBySelector[selector];
      if (!knownClasses) continue;
      for (const classMatch of match[2].matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
        const className = classMatch[1];
        if (!knownClasses.includes(className)) {
          hits.push({ selector, className, line: index + 1 });
        }
      }
    }
  });

  return hits;
}
