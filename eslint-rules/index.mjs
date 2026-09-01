import siblingBlankLine from './rules/sibling-blank-line.mjs';
import elementContentNewline from './rules/element-content-newline.mjs';
import controlFlowConditionNewline from './rules/control-flow-condition-newline.mjs';
import entryPointBoundary from './rules/entry-point-boundary.mjs';

export default {
  rules: {
    'template/sibling-blank-line': siblingBlankLine,
    'template/element-content-newline': elementContentNewline,
    'template/control-flow-condition-newline': controlFlowConditionNewline,
    'entry-point-boundary': entryPointBoundary,
  },
};
