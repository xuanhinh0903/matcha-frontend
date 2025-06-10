export type CallStatus =
  | 'initiating'
  | 'ringing'
  | 'connected'
  | 'ended'
  | null;

export interface OnEndCallParams {
  refetchMessages?: () => Promise<void>;
}
