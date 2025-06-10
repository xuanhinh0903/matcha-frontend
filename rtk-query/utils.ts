import { RootState } from '@/store/global';

export const prepareHeadersWithToken = (
  headers: Headers,
  { getState }: { getState: () => unknown }
) => {
  const state = getState() as RootState;

  // Add auth token if available
  if ((state.auth as any)?.token) {
    headers.set('Authorization', `Bearer ${(state.auth as any).token}`);
  }

  return headers;
};
