import { useGetNotificationsQuery } from '@/rtk-query';
import { useSelector } from 'react-redux';
import { getAuthUser } from '@/store/global/auth/auth.slice';
import { useTabFocus } from './use-tab-focus';
import { useState, useEffect } from 'react';

export function useNotificationsData() {
  const user = useSelector(getAuthUser);
  const isTabFocused = useTabFocus();
  const [shouldFetch, setShouldFetch] = useState(false);

  // Control when to fetch based on tab focus
  useEffect(() => {
    if (isTabFocused && user) {
      setShouldFetch(true);
    } else {
      setShouldFetch(false);
    }
  }, [isTabFocused, user]);

  // Use the regular query with skip parameter instead of lazy query
  const result = useGetNotificationsQuery(
    { page: 1, limit: 10 },
    {
      skip: !shouldFetch,
      refetchOnMountOrArgChange: true,
    }
  );

  return {
    ...result,
    refetch: () => {
      if (shouldFetch) {
        return result.refetch();
      }
      return Promise.resolve();
    },
  };
}
