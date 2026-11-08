import type { ChatMessageRole } from '@ids-group-ltd/ids-design-system/components/chat';

export const bubbleClass: Record<ChatMessageRole, string> = {
  user: 'bubble-mine',
  assistant: 'bubble-agent',
};
