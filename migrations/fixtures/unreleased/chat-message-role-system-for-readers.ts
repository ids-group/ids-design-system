import type { ChatMessageRole } from '@ids-group-ltd/ids-design-system/components/chat';

// @ts-expect-error after TS2366
export function speakerOf(role: ChatMessageRole): string {
  switch (role) {
    case 'user':
      return 'You';
    case 'assistant':
      return 'Agent';
  }
}

export function assertKnown(role: ChatMessageRole): void {
  if (role === 'user' || role === 'assistant') return;
  // @ts-expect-error after TS2322
  const unreachable: never = role;
  throw new Error(String(unreachable));
}

// @ts-expect-error after TS2741
export const avatars: Record<ChatMessageRole, string> = { user: 'me.png', assistant: 'bot.png' };

export const written: ChatMessageRole = 'assistant';
