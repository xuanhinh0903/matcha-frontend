import { Participant } from '@/types/message.type';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Socket } from 'socket.io-client';
import { User } from '../../../../../types/user.type';

interface UseMessageListLogicParams {
  socket: Socket | null;
  otherUser: Participant | null;
  callModalVisible: boolean;
  setCallModalVisible: (visible: boolean) => void;
  setCallStatus: (
    status: 'initiating' | 'ringing' | 'connected' | 'ended' | null
  ) => void;
  setIsOutgoingCall: (isOutgoing: boolean) => void;
  setActiveCallId: (callId: number | null) => void;
  setCallDuration: React.Dispatch<React.SetStateAction<number>>;
  callStatus: 'initiating' | 'ringing' | 'connected' | 'ended' | null;
  activeCallId: number | null;
  token: string | null;
  currentUser: User | null;
  authState: any;
  conversationId: number;
}

export const useMessageListLogic = ({
  socket,
  otherUser,
  callModalVisible,
  setCallStatus,
  setActiveCallId,
  callStatus,
  activeCallId,
  token,
  currentUser,
  authState,
  conversationId,
}: UseMessageListLogicParams) => {
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);
  const processedCallIds = useRef<Set<string>>(new Set());

  // Socket events handling
  useEffect(() => {
    if (!socket || !currentUser || !token) {
      console.log('[Call Debug] Socket not initialized or missing user/token');
      return;
    }

    console.log(
      '[Call Debug] Setting up call event listeners for user:',
      currentUser.user_id
    );
    console.log('[Call Debug] Other user in conversation:', otherUser?.user_id);
    console.log('[Call Debug] Socket connected status:', socket.connected);

    socket.on('connect', () => {
      console.log('[Call Debug] Socket connected in useMessageListLogic');
    });

    const handleIncomingCall = (data: {
      callId: string;
      caller: { user_id: number; full_name: string; photo_url?: string };
      callType?: 'audio' | 'video';
    }) => {
      console.log(
        '[Call Debug] Received call_received event:',
        JSON.stringify(data)
      );

      processedCallIds.current.add(data.callId);

      if (otherUser && data.caller.user_id === otherUser.user_id) {
        console.log('[Call Debug] Incoming call from conversation partner:');

        setActiveCallId(parseInt(data.callId, 10));

        router.push({
          pathname: '/(call)',
          params: {
            userId: data.caller.user_id.toString(),
            userName: data.caller.full_name || 'Unknown User',
            userAvatar: data.caller.photo_url || 'https://picsum.photos/200',
            callType: data.callType || 'video',
            isOutgoing: 'false',
            callId: data.callId.toString(),
            conversationId,
          },
        });
      } else {
        console.log(
          '[Call Debug] Ignoring call_received event - not from current conversation partner'
        );
      }
    };

    const handleCallAccepted = (data: { callId: string }) => {
      console.log(
        '[Call Debug] Received call_accepted event:',
        JSON.stringify(data)
      );
      if (data.callId === activeCallId?.toString()) {
        setCallStatus('connected');
      }
    };

    const handleCallRejected = (data: { callId: string }) => {
      console.log(
        '[Call Debug] Received call_rejected event:',
        JSON.stringify(data)
      );
      if (data.callId === activeCallId?.toString()) {
        setCallStatus('ended');
        setActiveCallId(null);
        if (callTimerRef.current) clearInterval(callTimerRef.current);
      }
    };

    const handleCallEnded = (data: { callId: string }) => {
      console.log(
        '[Call Debug] Received call_ended event:',
        JSON.stringify(data)
      );
      if (data.callId === activeCallId?.toString()) {
        setCallStatus('ended');
        setActiveCallId(null);
        if (callTimerRef.current) clearInterval(callTimerRef.current);
      }
    };

    const handleCallCancelled = (data: { callId: string }) => {
      console.log(
        '[Call Debug] Received call_cancelled event:',
        JSON.stringify(data)
      );
      if (data.callId === activeCallId?.toString()) {
        console.log('[Call Debug] Call was cancelled by the caller');
        setCallStatus('ended');
        setActiveCallId(null);

        // Navigate away if on call screen
        router.replace({
          pathname: '/(message-detail)',
          params: { conversation_id: conversationId },
        });

        if (callTimerRef.current) {
          clearInterval(callTimerRef.current);
          callTimerRef.current = null;
        }
      }
    };

    console.log('[Call Debug] Adding event listeners for call events');
    socket.on('call_received', handleIncomingCall);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_rejected', handleCallRejected);
    socket.on('call_ended', handleCallEnded);
    socket.on('call_cancelled', handleCallCancelled);

    const handleAnyEvent = (event: string, ...args: any[]) => {
      if (event.startsWith('call_')) {
        console.log(
          `[Call Debug] Caught generic event: ${event}`,
          JSON.stringify(args)
        );
      }
    };

    if (typeof socket.onAny === 'function') {
      socket.onAny(handleAnyEvent);
    } else {
      console.log(
        '[Call Debug] socket.onAny is not available on this socket instance'
      );
    }

    return () => {
      console.log('[Call Debug] Cleaning up call event listeners');
      socket.off('call_received', handleIncomingCall);
      socket.off('call_accepted', handleCallAccepted);
      socket.off('call_rejected', handleCallRejected);
      socket.off('call_ended', handleCallEnded);
      socket.off('call_cancelled', handleCallCancelled);

      if (typeof socket.offAny === 'function') {
        socket.offAny(handleAnyEvent);
      }

      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [socket, currentUser, token, otherUser, activeCallId]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      _handleAppStateChange
    );
    return () => {
      subscription.remove();
    };
  }, [socket, activeCallId]);

  // Log when any AppState changes occur to help with debugging
  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log(
      '[Call Debug] App state changed:',
      appState.current,
      '->',
      nextAppState
    );

    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App came to foreground
      if (socket && !socket.connected) {
        console.log('[Call Debug] App came to foreground, reconnecting socket');
        socket.connect();
      }

      // When app comes to foreground, check if we should clear processed call IDs
      if (callStatus === null || callStatus === 'ended') {
        console.log(
          '[Call Debug] App returned to foreground, clearing processed calls cache'
        );
        processedCallIds.current.clear();
      }
    }

    appState.current = nextAppState;
  };

  useEffect(() => {
    if (callStatus === 'ended' || !callModalVisible) {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    }
  }, [callStatus, callModalVisible]);

  // Clear processed call IDs when call state changes
  useEffect(() => {
    if (callStatus === null || callStatus === 'ended') {
      // Clear processed call IDs when no active call to allow new calls
      console.log('[Call Debug] Clearing processed call IDs cache');
      processedCallIds.current.clear();
    }
  }, [callStatus]);

  useEffect(() => {
    if (!authState?._persist?.rehydrated) {
      console.log('Auth state not rehydrated yet');
    }
  }, [authState?._persist?.rehydrated]);

  return {
    // Return any values needed by the component
  };
};
