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

const unblockUser = async ({
  blockedUserId,
}: BlockUserParams): Promise<void> => {
  await client.delete(`/user-block/${blockedUserId}`);
};

const getBlockedUsers = async (): Promise<number[]> => {
  const res = await client.get('/user-block');
  // Returns array of blocked user objects, map to user_id
  return res.data.map((u: any) => u.user_id);
};

export const useBlockUser = (token: string) => {
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

export const useUnblockUser = (token: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unblockUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CONVERSATIONS.lists(),
        exact: true,
      });
    },
  });
};

export const useBlockedUsers = () => {
  return {
    queryKey: ['blocked-users'],
    queryFn: getBlockedUsers,
  };
};
