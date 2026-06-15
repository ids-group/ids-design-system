import siblingBlankLine from './rules/sibling-blank-line.mjs';
import elementContentNewline from './rules/element-content-newline.mjs';

export default {
  rules: {
    'template/sibling-blank-line': siblingBlankLine,
    'template/element-content-newline': elementContentNewline,
  },
};
