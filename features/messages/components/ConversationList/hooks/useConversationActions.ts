import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useDeleteConversation } from '../../../../../api/messages';
import { getAuthToken } from '../../../../../store/global/auth/auth.slice';
import {
  showErrorToast,
  showSuccessToast,
} from '../../../../../helpers/toast.helper';
import { useBlockUser } from '@/api/user-block';

export const useConversationActions = () => {
  const token = useSelector(getAuthToken);

  // API mutation hooks
  const { mutateAsync: deleteConversation } = useDeleteConversation(
    token || ''
  );
  const { mutateAsync: blockUser } = useBlockUser(token || '');

  const handleDeleteConversation = useCallback(
    async (conversationId: number) => {
      try {
        await deleteConversation({ conversationId });
        showSuccessToast('Conversation deleted successfully');
      } catch (error) {
        console.error('Failed to delete conversation:', error);
        showErrorToast('Failed to delete conversation');
      }
    },
    [deleteConversation]
  );

  const handleBlockUser = useCallback(
    async (userId: number) => {
      try {
        await blockUser({ blockedUserId: userId });
        showSuccessToast('User blocked successfully');
      } catch (error) {
        console.error('Failed to block user:', error);
        showErrorToast('Failed to block user');
      }
    },
    [blockUser]
  );

  return {
    handleDeleteConversation,
    handleBlockUser,
  };
};

export default useConversationActions;
