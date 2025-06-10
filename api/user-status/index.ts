import { useMutation } from '@tanstack/react-query';
import { client } from '../common/client';

// Online status API endpoint
interface UpdateOnlineStatusParams {
  isOnline: boolean;
}

const updateOnlineStatus = async ({
  isOnline,
}: UpdateOnlineStatusParams): Promise<void> => {
  await client.put('/user/online-status', { isOnline });
};

export const useUpdateOnlineStatus = () => {
  return useMutation({
    mutationFn: updateOnlineStatus,
  });
};
