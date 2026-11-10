import * as React from 'react';

/**
 * ChatSteps — the real ChatStepsComponent, run by Angular behind `<ds-chat-steps>`.
 * An agent's steps for a chat reply (`ds-chat-steps`): a compact list of `ChatStep` children, drawn on the thread's surface above the reply's bubble. Its only expected children are `ChatStep` elements; the connector between markers is drawn by the steps.
 */
export interface ChatStepsProps {
  /** How steps that arrive together (a plan given at once) come in: `'together'` grows them in as one block, `'stagger'` one after another. Steps that arrive one at a time grow in either way. */
  enter?: ('together' | 'stagger');
  /** Shortest time a step shows as running before its final status, even when it finishes at once; `0` shows the final status at once. */
  minRunningMs?: number;
  /** Shortest gap between two steps showing their final status, so steps that finish together settle one after another; `0` lets them settle together. */
  revealStaggerMs?: number;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ChatSteps: React.ComponentType<ChatStepsProps>;
