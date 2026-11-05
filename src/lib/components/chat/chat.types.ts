export type ChatMessageRole = 'user' | 'assistant' | 'system';

export type ChatMessageTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export type ChatMessageStatus = 'sending' | 'sent' | 'failed';

export type ChatStepsEnter = 'together' | 'stagger';

export type ChatStepStatus =
  | 'done'
  | 'running'
  | 'pending'
  | 'waiting'
  | 'error';
