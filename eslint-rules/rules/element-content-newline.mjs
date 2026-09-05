import { detectEol } from '../eol.mjs';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'layout',
    docs: {
      description:
        'Require element content to be on its own line, separate from opening and closing tags',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      contentOnTagLine:
        'Element content should be on a new line, separate from opening and closing tags.',
    },
  },

  create(context) {
    const text = context.sourceCode.getText();
    const eol = detectEol(text);

    function isAtLineStart(offset) {
      const lineStart = text.lastIndexOf('\n', offset - 1) + 1;
      return !/\S/.test(text.substring(lineStart, offset));
    }

    // Inside these, whitespace IS content — the indentation this rule adds renders.
    // Matched by source range, not node name: a <code> inside a <pre> is exempt too.
    const WHITESPACE_SENSITIVE = /<(pre|textarea)\b[\s\S]*?<\/\1>/gi;
    const exemptRanges = Array.from(
      text.matchAll(WHITESPACE_SENSITIVE),
      (m) => [m.index, m.index + m[0].length],
    );

    function isWhitespaceSensitive(offset) {
      return exemptRanges.some(
        ([start, end]) => offset >= start && offset < end,
      );
    }

    // Phrasing elements whose surrounding whitespace is RENDERED. Breaking one open puts a space
    // inside it, and `.t-mono-inline` paints a padded pill, so the chip grows 14% and any following
    // comma is pushed off the word. The line-start test below cannot catch these: a reflow that
    // moves a chip to column 0 is exactly what turned 870 of them back into the padded form.
    const INLINE_TAGS = new Set([
      'code', 'em', 'strong', 'b', 'i', 'u', 's', 'small', 'mark', 'kbd', 'samp', 'var',
      'abbr', 'cite', 'q', 'sub', 'sup', 'time', 'span',
    ]);

    function isSelfClosing(node) {
      const tag = text.substring(
        node.startSourceSpan.start.offset,
        node.startSourceSpan.end.offset,
      );
      return tag.trimEnd().endsWith('/>');
    }

    function check(node) {
      if (!node.endSourceSpan) return;

      if (isWhitespaceSensitive(node.startSourceSpan.start.offset)) return;

      if (INLINE_TAGS.has(node.name)) return;

      // Skip self-closing elements (<input />, <br />, <ng-content />, etc.)
      if (isSelfClosing(node)) return;

      // Skip inline elements (mid-line after other content)
      if (!isAtLineStart(node.startSourceSpan.start.offset)) return;

      const innerStart = node.startSourceSpan.end.offset;
      const innerEnd = node.endSourceSpan.start.offset;

      // Self-closing / void elements have overlapping spans
      if (innerStart > innerEnd) return;

      const inner = text.substring(innerStart, innerEnd);

      if (!/\S/.test(inner)) {
        // For empty elements with multi-line opening tag, closing tag should be on its own line
        const multiLineOpen =
          node.startSourceSpan.start.line !== node.startSourceSpan.end.line;
        const closingOnSameLine =
          node.startSourceSpan.end.line === node.endSourceSpan.start.line;

        if (multiLineOpen && closingOnSameLine) {
          const tagIndent = ' '.repeat(node.startSourceSpan.start.col);

          context.report({
            node,
            messageId: 'contentOnTagLine',
            fix(fixer) {
              return fixer.replaceTextRange(
                [innerStart, innerEnd],
                eol + tagIndent,
              );
            },
          });
        }

        return;
      }

      const leadingWs = inner.match(/^(\s*)/)[1];
      const trailingWs = inner.match(/(\s*)$/)[1];

      const startsOnOpenLine = !leadingWs.includes('\n');
      const endsOnCloseLine = !trailingWs.includes('\n');

      if (!startsOnOpenLine && !endsOnCloseLine) return;

      const tagIndent = ' '.repeat(node.startSourceSpan.start.col);
      const contentIndent = tagIndent + '  ';

      context.report({
        node,
        messageId: 'contentOnTagLine',
        fix(fixer) {
          const fixes = [];

          if (startsOnOpenLine) {
            fixes.push(
              fixer.replaceTextRange(
                [innerStart, innerStart + leadingWs.length],
                eol + contentIndent,
              ),
            );
          }

          if (endsOnCloseLine) {
            fixes.push(
              fixer.replaceTextRange(
                [innerEnd - trailingWs.length, innerEnd],
                eol + tagIndent,
              ),
            );
          }

          return fixes;
        },
      });
    }

    return {
      Element: check,
      Template: check,
    };
  },
};
