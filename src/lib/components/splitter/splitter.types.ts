/** `'horizontal'` lays the panes side by side with an upright handle; `'vertical'` stacks them. */
export type SplitterOrientation = 'horizontal' | 'vertical';

/** The pane `size` measures: the first projected pane or the second. The other takes the rest. */
export type SplitterPane = 'start' | 'end';

/** `'elastic'`: dragged past `min` or `max`, the handle follows with growing resistance and springs
 *  back on release. `'none'`: it stops at the limit. */
export type SplitterOverscroll = 'elastic' | 'none';
