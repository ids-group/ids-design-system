/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'layout',
    docs: {
      description:
        'Require blank lines between sibling block-level elements in Angular templates',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      missingBlankLine: 'Expected a blank line between sibling elements.',
    },
  },

  create(context) {
    const text = context.sourceCode.getText();

    const BLOCK_TYPES = new Set([
      'Element',
      'Template',
      'IfBlock',
      'ForLoopBlock',
      'SwitchBlock',
      'DeferredBlock',
      'Content',
      'LetDeclaration',
    ]);

    function isBlockNode(node) {
      return BLOCK_TYPES.has(node.type);
    }

    function isInlineContent(node) {
      if (node.type === 'BoundText') return true;
      if (node.type === 'Text' && !/^\s*$/.test(node.value)) return true;
      return false;
    }

    function isAtLineStart(offset) {
      const lineStart = text.lastIndexOf('\n', offset - 1) + 1;
      return !/\S/.test(text.substring(lineStart, offset));
    }

    function checkChildren(children, parentNode) {
      if (!children || !Array.isArray(children)) return;

      let prevBlock = null;

      for (const child of children) {
        if (isBlockNode(child)) {
          if (prevBlock) {
            // Consecutive @let declarations don't need blank lines
            if (
              prevBlock.type === 'LetDeclaration' &&
              child.type === 'LetDeclaration'
            ) {
              prevBlock = child;
              continue;
            }

            let startOffset = prevBlock.sourceSpan.end.offset;

            // LetDeclaration's sourceSpan excludes the trailing ";"
            if (prevBlock.type === 'LetDeclaration' && text[startOffset] === ';') {
              startOffset++;
            }

            const endOffset = child.sourceSpan.start.offset;
            const between = text.substring(startOffset, endOffset);

            if (!/\r?\n[ \t]*\r?\n/.test(between)) {
              let indentCol = child.sourceSpan.start.col;

              // If child is mid-line, its column is wrong for indentation
              if (!isAtLineStart(child.sourceSpan.start.offset)) {
                if (isAtLineStart(prevBlock.sourceSpan.start.offset)) {
                  indentCol = prevBlock.sourceSpan.start.col;
                } else if (parentNode?.sourceSpan) {
                  indentCol = parentNode.sourceSpan.start.col + 2;
                }
              }

              const indent = ' '.repeat(indentCol);
              const canFix = /^\s*$/.test(between);

              context.report({
                node: child,
                messageId: 'missingBlankLine',
                ...(canFix && {
                  fix(fixer) {
                    return fixer.replaceTextRange(
                      [startOffset, endOffset],
                      '\n\n' + indent,
                    );
                  },
                }),
              });
            }
          }
          prevBlock = child;
        } else if (isInlineContent(child)) {
          prevBlock = null;
        }
      }
    }

    const containerVisitor = (node) => checkChildren(node.children, node);

    return {
      Program(node) {
        checkChildren(node.templateNodes, null);
      },
      Element: containerVisitor,
      Template: containerVisitor,
      IfBlockBranch: containerVisitor,
      ForLoopBlock: containerVisitor,
      ForLoopBlockEmpty: containerVisitor,
      SwitchBlockCaseGroup: containerVisitor,
      DeferredBlock: containerVisitor,
      DeferredBlockLoading: containerVisitor,
      DeferredBlockError: containerVisitor,
      DeferredBlockPlaceholder: containerVisitor,
      Content: containerVisitor,
    };
  },
};
