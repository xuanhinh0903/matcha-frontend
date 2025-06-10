import { useMemo } from 'react';
import { Conversation } from '../../../../../types/message.type';
import { convertToParticipant } from '../../../../../utils/conversation.utils';

export const useFilteredConversations = (
  conversations: Conversation[] | undefined,
  searchQuery: string,
  userId?: number
) => {
  return useMemo(() => {
    if (!conversations || !userId) return [];
    if (!searchQuery.trim()) return conversations;

    const query = searchQuery.toLowerCase().trim();
    return conversations.filter((conv) => {
      const otherParticipant = conv.other_user
        ? convertToParticipant(conv.other_user)
        : conv.participants?.find((p) => p.user_id !== userId);
      if (!otherParticipant) return false;

      return (
        otherParticipant.full_name.toLowerCase().includes(query) ||
        conv.last_message?.content.toLowerCase().includes(query)
      );
    });
  }, [conversations, searchQuery, userId]);
};

export default useFilteredConversations;
