export type ChatMessageRole = 'user' | 'assistant' | 'system';

export type ChatMessageStatus = 'sending' | 'sent' | 'failed';

export type ChatStepsEnter = 'together' | 'stagger';

export type ChatStepStatus =
  | 'done'
  | 'running'
  | 'pending'
  | 'waiting'
  | 'error';
