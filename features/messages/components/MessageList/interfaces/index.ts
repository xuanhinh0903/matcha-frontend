import { Message, Conversation } from '../../../../../types/message.type';

// Interface for message group with context
export interface MessageWithContext {
  matchedMessage: Message;
  contextMessages: Message[];
  id: string;
}

export interface MessageListProps {
  conversationId: number;
  onBack: () => void;
  visible: boolean;
}
