import * as React from 'react';

/**
 * ChatStep — the real ChatStepComponent, run by Angular behind `<ds-chat-step>`.
 * One step of an agent's work (`ds-chat-step`): a 16px marker on a connector beside a heading, at the smaller text size. Use as a child of `ChatSteps`.
 */
export interface ChatStepProps {
  /** What the step does, such as "Run the build". */
  heading?: string;
  /** Time or duration label under the content. */
  time?: string;
  /** Where the step is: draws the marker and is spoken before the heading. */
  status?: ('done' | 'running' | 'pending' | 'waiting' | 'error') | null;
  /** Whether the `[details]` area is open, two-way bound. */
  expanded?: boolean;
  onExpandedChange?: (value: boolean) => void;
  /** Content for the `[trailing]` slot. */
  trailing?: React.ReactNode;
  /** Content for the `[details]` slot. */
  details?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ChatStep: React.ComponentType<ChatStepProps>;
