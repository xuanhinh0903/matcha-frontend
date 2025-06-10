import { useState, useCallback, useEffect } from 'react';
import { IDiscoverUser } from '@/types/discover.type';

interface UseRefreshDataProps {
  peopleToDiscover: IDiscoverUser[];
  refetch: () => void;
}

export const useRefreshData = ({
  peopleToDiscover,
  refetch,
}: UseRefreshDataProps) => {
  const [users, setUsers] = useState<IDiscoverUser[]>(peopleToDiscover);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (peopleToDiscover?.length > 0) {
      setUsers(peopleToDiscover);
    }
  }, [peopleToDiscover]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [refetch]);

  return {
    users,
    setUsers,
    refreshing,
    onRefresh,
  };
};
