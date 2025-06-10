import { store } from '@/store/global';
import { callsActions } from '@/store/global/calls';
import { User } from '@/types';
import { Participant } from '@/types/message.type';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { Socket } from 'socket.io-client';

// Debug function to log current registry state
export const debugCallRegistry = () => {
  const state = store.getState();
  console.log(
    '[Call Registry] Current active calls:',
    JSON.stringify(state.calls.activeCallRegistry || {})
  );
  console.log(
    '[Call Registry] Recently ended calls:',
    JSON.stringify(state.calls.recentlyEndedCalls || {})
  );
};

// Reset the registry (for testing/debugging)
export const resetCallRegistry = () => {
  console.log('[Call Registry] RESETTING REGISTRY via action');
  store.dispatch(callsActions.resetCallRegistry());
};

export const isCallActive = (callId: string | number): boolean => {
  if (!callId) return false;

  const strCallId = String(callId);
  const state = store.getState();

  // Add null checks to prevent runtime errors
  if (!state.calls || !state.calls.activeCallRegistry) {
    console.log('[Call Registry] Redux state not fully initialized');
    return false;
  }

  // Check if call is active in registry
  const isActive = !!state.calls.activeCallRegistry[strCallId];

  console.log(
    `[Call Registry] isCallActive check for ${strCallId}: ${
      isActive ? 'ACTIVE' : 'NOT ACTIVE'
    }`
  );

  // Also check if this call was recently ended
  const recentlyEndedCalls = state.calls.recentlyEndedCalls || {};
  const endedTimestamp = recentlyEndedCalls[strCallId];

  if (endedTimestamp) {
    const now = Date.now();
    const timeSinceEnd = now - endedTimestamp;
    // If call was ended less than 5 seconds ago, consider it "still ending" to prevent bounce-back
    if (timeSinceEnd < 5000) {
      console.log(
        `[Call Registry] Call ${callId} was recently ended (${timeSinceEnd}ms ago). Blocking new attempt.`
      );
      return true;
    }
  }

  return isActive;
};

export const registerActiveCall = (callId: string | number): void => {
  if (!callId) return;

  const strCallId = String(callId);
  store.dispatch(callsActions.registerActiveCall(strCallId));
};

export const unregisterActiveCall = (callId: string | number): void => {
  if (!callId) return;

  const strCallId = String(callId);
  // Just dispatch the regular action instead of the thunk to avoid type issues
  store.dispatch(callsActions.unregisterActiveCall(strCallId));

  // Set up a timeout to clean up the call after a delay
  setTimeout(() => {
    store.dispatch(callsActions.cleanupEndedCall(strCallId));
  }, 10000);
};

interface CallHandlerParams {
  otherUser: Participant | null;
  currentUser: User | null;
  token: string | null;
  startCall: (params: { receiverId: number }) => Promise<{ call_id: number }>;
  endCall: (params: { callId: number }) => Promise<void>;
  socket: Socket | null;
  setCallModalVisible: (visible: boolean) => void;
  setCallStatus: (
    status: 'initiating' | 'ringing' | 'connected' | 'ended' | null
  ) => void;
  setIsOutgoingCall: (isOutgoing: boolean) => void;
  setActiveCallId: (callId: number | null) => void;
  activeCallId: number | null;
  callStatus: 'initiating' | 'ringing' | 'connected' | 'ended' | null;
  isOutgoingCall: boolean;
}

export const createCallHandlers = ({
  otherUser,
  currentUser,
  token,
  startCall,
  endCall,
  socket,
  setCallModalVisible,
  setCallStatus,
  setIsOutgoingCall,
  setActiveCallId,
  activeCallId,
  callStatus,
  isOutgoingCall,
}: CallHandlerParams) => {
  const handleCall = async () => {
    if (!otherUser || !currentUser || !token) {
      Alert.alert('Error', 'Cannot initiate call. User data missing.');
      return;
    }

    console.log(`Initiating call to ${otherUser.full_name}`);
    setIsOutgoingCall(true);
    setCallStatus('initiating');

    try {
      const { call_id } = await startCall({ receiverId: otherUser.user_id });

      if (isCallActive(call_id)) {
        console.log(
          `Call ID ${call_id} is already active. Preventing duplicate call screen.`
        );
        return;
      }

      registerActiveCall(call_id);
      setActiveCallId(call_id);
      console.log(`Call initiated with ID: ${call_id}`);

      // Navigate to call screen instead of showing modal
      router.push({
        pathname: '/(call)',
        params: {
          userId: otherUser.user_id.toString(),
          userName: otherUser.full_name || 'Unknown User',
          userAvatar: otherUser.photo_url || 'https://picsum.photos/200',
          callType: 'video', // Default to video call - can be modified if needed
          isOutgoing: 'true',
          callId: call_id.toString(),
        },
      });
    } catch (error: any) {
      console.error('Failed to start call:', error);
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Unknown error';
      Alert.alert('Error', `Failed to start call: ${errorMessage}`);
      setCallStatus(null);
      setActiveCallId(null);
    }
  };

  // These handlers are kept for compatibility with existing code
  // but will rarely be used since we're using CallScreen now
  const handleAcceptCall = () => {
    if (!socket || !activeCallId || isOutgoingCall) return;

    console.log(`Accepting call ID: ${activeCallId}`);
    socket.emit('call_accept', { call_id: activeCallId });
    setCallStatus('connected');
  };

  const handleRejectCall = () => {
    if (!socket || !activeCallId) return;

    console.log(`Rejecting call ID: ${activeCallId}`);
    if (isOutgoingCall) {
      handleEndCall();
    } else {
      socket.emit('call_reject', { call_id: activeCallId });
      setCallModalVisible(false);
      setCallStatus(null);
      setActiveCallId(null);
    }
  };

  const handleEndCall = async () => {
    if (!activeCallId || !token) {
      console.log('Cannot end call, missing call ID or token.');
      setCallModalVisible(false);
      setCallStatus('ended');
      setTimeout(() => {
        setCallStatus(null);
        setActiveCallId(null);
      }, 1500);
      return;
    }

    console.log(`Ending call ID: ${activeCallId}`);
    setCallStatus('ended');

    try {
      await endCall({ callId: activeCallId });
      console.log(`Call ${activeCallId} ended successfully via API.`);
    } catch (error: any) {
      console.error('Failed to end call via API:', error);
    } finally {
      unregisterActiveCall(activeCallId);
      setCallModalVisible(false);
      setTimeout(() => {
        setCallStatus(null);
        setActiveCallId(null);
      }, 1500);
    }
  };

  return { handleCall, handleAcceptCall, handleRejectCall, handleEndCall };
};
