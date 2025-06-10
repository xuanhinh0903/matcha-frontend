import { Message } from '../../../../../types/message.type';
import { MessageWithContext } from '../interfaces';
import { CONTEXT_MESSAGE_COUNT } from '../constants';

// Helper function to create message groups with context
export const createMessageGroupsWithContext = (
  matchedMessages: Message[],
  allMessages: Message[]
): MessageWithContext[] => {
  if (!matchedMessages?.length || !allMessages?.length) return [];

  // Sort all messages by sent_at in ascending order
  const sortedMessages = [...allMessages].sort(
    (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
  );

  return matchedMessages.map((matchedMessage) => {
    // Find the index of the matched message in the sorted array
    const matchIndex = sortedMessages.findIndex(
      (msg) => msg.message_id === matchedMessage.message_id
    );

    if (matchIndex === -1) {
      // If message not found in allMessages, just return the message itself
      return {
        matchedMessage,
        contextMessages: [matchedMessage],
        id: `match-${matchedMessage.message_id}`,
      };
    }

    // Get messages before and after for context
    const startIndex = Math.max(0, matchIndex - CONTEXT_MESSAGE_COUNT);
    const endIndex = Math.min(
      sortedMessages.length - 1,
      matchIndex + CONTEXT_MESSAGE_COUNT
    );

    // Extract the context messages
    const contextMessages = sortedMessages.slice(startIndex, endIndex + 1);

    return {
      matchedMessage,
      contextMessages,
      id: `match-${matchedMessage.message_id}`,
    };
  });
};
