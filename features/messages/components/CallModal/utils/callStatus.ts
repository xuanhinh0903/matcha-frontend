import { CallStatus } from '../types';

// Call state message helper
export const getStatusMessage = (
  callStatus: CallStatus,
  isOutgoing: boolean,
  userName: string
) => {
  switch (callStatus) {
    case 'initiating':
      return isOutgoing ? `Calling ${userName}...` : `Incoming call...`;
    case 'ringing':
      return isOutgoing ? `Ringing...` : `${userName} is calling you`;
    case 'connected':
      return 'On call';
    case 'ended':
      return 'Call ended';
    default:
      return '';
  }
};
