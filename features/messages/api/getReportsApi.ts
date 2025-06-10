import { client } from '@/api/common/client';

export const getReports = async () => {
  const response = await client.get('/reports');
  return response.data;
};
