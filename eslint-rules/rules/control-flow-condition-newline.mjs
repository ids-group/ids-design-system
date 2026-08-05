/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'layout',
    docs: {
      description:
        'Require a broken-up @if / @else if condition to put each top-level operand on its own line, with the closing paren on its own line',
    },
    fixable: 'whitespace',
    schema: [
      {
        type: 'object',
        properties: {
          minOperands: { type: 'integer', minimum: 2 },
          operandIndent: { type: 'integer', minimum: 0 },
          closingIndent: { type: 'integer', minimum: 0 },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      splitOperands:
        'Put each top-level operand of this condition on its own line, with `) {` on its own line.',
    },
  },

  create(context) {
    const {
      minOperands = 3,
      operandIndent = 4,
      closingIndent = 2,
    } = context.options[0] ?? {};
    const text = context.sourceCode.getText();

    // Splits on `||` / `&&` that sit at paren/bracket depth 0 and outside quotes,
    // so `a && (b || c)` and `x === '||'` stay whole.
    function topLevelOperands(condition) {
      const parts = [];
      let depth = 0;
      let quote = null;
      let start = 0;
      for (let index = 0; index < condition.length; index++) {
        const char = condition[index];
        if (quote) {
          if (char === quote && condition[index - 1] !== '\\') quote = null;
          continue;
        }
        if (char === '"' || char === "'" || char === '`') {
          quote = char;
          continue;
        }
        if (char === '(' || char === '[' || char === '{') depth++;
        else if (char === ')' || char === ']' || char === '}') depth--;
        else if (
          depth === 0 &&
          (condition.startsWith('||', index) || condition.startsWith('&&', index))
        ) {
          parts.push({
            expression: condition.slice(start, index).trim(),
            operator: condition.substr(index, 2),
          });
          index++;
          start = index + 1;
        }
      }
      parts.push({ expression: condition.slice(start).trim(), operator: '' });

      return parts;
    }

    return {
      IfBlockBranch(node) {
        // `@else` carries no condition; nothing to lay out.
        if (!node.expression) return;

        const openStart = node.startSourceSpan.start.offset;
        const openEnd = node.startSourceSpan.end.offset;
        const opening = text.substring(openStart, openEnd);
        const parenAt = opening.indexOf('(');
        if (parenAt === -1) return;

        // The condition ends at the last `)` of the opening span, which closes
        // the one opened above - the span stops at the block's `{`.
        const closeAt = opening.lastIndexOf(')');
        if (closeAt <= parenAt) return;

        const condition = opening.substring(parenAt + 1, closeAt);
        const operands = topLevelOperands(condition);

        // Operand COUNT, not line length, is the trigger, so the shape does not
        // flip while a condition is edited. Default 3: a pair still reads fine
        // inline, and exploding it into four lines was pure noise.
        if (operands.length < minOperands) return;

        const base = ' '.repeat(node.startSourceSpan.start.col);
        const operandPad = base + ' '.repeat(operandIndent);
        const closingPad = base + ' '.repeat(closingIndent);
        const wanted =
          '\n' +
          operands
            .map(
              ({ expression, operator }) =>
                operandPad + expression + (operator ? ' ' + operator : ''),
            )
            .join('\n') +
          '\n' +
          closingPad;

        if (condition === wanted) return;

        context.report({
          node,
          messageId: 'splitOperands',
          fix(fixer) {
            return fixer.replaceTextRange(
              [openStart + parenAt + 1, openStart + closeAt],
              wanted,
            );
          },
        });
      },
    };
  },
};
