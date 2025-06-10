import { useQuery } from '@tanstack/react-query';
import { client } from '../common/client';

// Types
export interface UserReport {
  id: string;
  content: string;
  images: string[];
  type: string;
  status: 'Pending' | 'Resolved';
  dateReported: string;
  dateResolved?: string;
  adminFeedback?: string;
  reportedUser: {
    id: string;
    username: string;
  };
}

export interface GetUserReportsParams {
  filter?: string;
  sortOrder?: 'asc' | 'desc';
}

// API Functions
export const getUserSubmittedReports = async (
  params?: GetUserReportsParams
): Promise<UserReport[]> => {
  let url = '/reports/user/submitted';

  const queryParams = [];
  if (params?.filter && params.filter !== 'All') {
    queryParams.push(`filter=${encodeURIComponent(params.filter)}`);
  }
  if (params?.sortOrder) {
    queryParams.push(`sortOrder=${params.sortOrder}`);
  }

  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }

  const response = await client.get(url);
  return response.data;
};

// React Query Hooks
export const useUserSubmittedReports = (params?: GetUserReportsParams) => {
  return useQuery({
    queryKey: ['userReports', params?.filter, params?.sortOrder],
    queryFn: () => getUserSubmittedReports(params),
    staleTime: 60000, // 1 minute
  });
};
