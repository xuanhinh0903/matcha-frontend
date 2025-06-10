import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '../common/client';
import { CONVERSATIONS } from '../messages';

// Block user API endpoint
interface BlockUserParams {
  blockedUserId: number;
}

const blockUser = async ({ blockedUserId }: BlockUserParams): Promise<void> => {
  await client.post(`/user-block/${blockedUserId}`);
};

export const useUnmatchUser = (token: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blockUser,
    onSuccess: async () => {
      // Invalidate conversations list to refresh after blocking a user
      await queryClient.invalidateQueries({
        queryKey: CONVERSATIONS.lists(),
        exact: true,
      });
    },
  });
};
