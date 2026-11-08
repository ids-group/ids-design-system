type AppMessageRole = 'user' | 'assistant';

export const bubbleClass: Record<AppMessageRole, string> = {
  user: 'bubble-mine',
  assistant: 'bubble-agent',
};
