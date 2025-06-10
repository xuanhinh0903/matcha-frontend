import { useEffect } from 'react';

import { MODAL_CLOSE_DELAY } from '../utils/callHandlers';
import { handleAuthError, isTokenExpired } from '@/helpers';

export const useMessageListEffects = ({
  visible,
  translateX,
  overlayOpacity,
  socket,
  otherUser,
  callModalVisible,
  setCallModalVisible,
  setCallStatus,
  setIsOutgoingCall,
  setActiveCallId,
  setCallDuration,
  callStatus,
  token,
  currentUser,
  authState,
  withSpring,
}: {
  visible: boolean;
  translateX: any;
  overlayOpacity: any;
  socket: any;
  otherUser: any | null;
  callModalVisible: boolean;
  setCallModalVisible: (visible: boolean) => void;
  setCallStatus: (
    status: 'initiating' | 'ringing' | 'connected' | 'ended' | null
  ) => void;
  setIsOutgoingCall: (isOutgoing: boolean) => void;
  setActiveCallId: (id: number | null) => void;
  setCallDuration: (duration: number) => void;
  callStatus: 'initiating' | 'ringing' | 'connected' | 'ended' | null;
  token: string | null;
  currentUser: any | null;
  authState: any;
  withSpring: any;
}) => {
  // Animation effect when component becomes visible
  useEffect(() => {
    if (visible) {
      translateX.value = withSpring(0);
      overlayOpacity.value = withSpring(0.3);
    }
  }, [visible, translateX, overlayOpacity, withSpring]);

  // WebSocket effect for call events
  useEffect(() => {
    if (!socket || !otherUser) return;

    const onCallInitiated = (data: any) => {
      if (data.caller.user_id === otherUser.user_id) {
        setIsOutgoingCall(false);
        setCallStatus('ringing');
        setCallModalVisible(true);
        setActiveCallId(data.call_id);
      }
    };

    const onCallAccepted = () => {
      setCallStatus('connected');
    };

    const onCallRejected = () => {
      if (callModalVisible) {
        setCallStatus('ended');
        setTimeout(() => {
          setCallModalVisible(false);
          setCallStatus(null);
        }, MODAL_CLOSE_DELAY);
      }
    };

    const onCallEnded = (data: any) => {
      if (callModalVisible) {
        setCallStatus('ended');
        setCallDuration(data.duration);
        setTimeout(() => {
          setCallModalVisible(false);
          setCallStatus(null);
        }, MODAL_CLOSE_DELAY);
      }
    };

    socket.on('call_initiated', onCallInitiated);
    socket.on('call_accepted', onCallAccepted);
    socket.on('call_rejected', onCallRejected);
    socket.on('call_ended', onCallEnded);

    return () => {
      socket.off('call_initiated', onCallInitiated);
      socket.off('call_accepted', onCallAccepted);
      socket.off('call_rejected', onCallRejected);
      socket.off('call_ended', onCallEnded);
    };
  }, [
    socket,
    callModalVisible,
    otherUser,
  ]);

  // Auth validation effect
  useEffect(() => {
    if (!authState?._persist?.rehydrated) {
      return;
    }

    if (token && isTokenExpired(token)) {
      handleAuthError();
      return;
    }

    if (!token || !currentUser) {
      handleAuthError();
    }
  }, [token, currentUser, authState]);
};
