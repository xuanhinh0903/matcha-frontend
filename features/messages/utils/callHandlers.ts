import { Alert } from 'react-native';

export const MODAL_CLOSE_DELAY = 2000;

export function createCallHandlers({
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
}: {
  otherUser: any | null;
  currentUser: any | null;
  token: string | null;
  startCall: (args: any) => Promise<any>;
  endCall: (args: any) => Promise<any>;
  socket: any;
  setCallModalVisible: (visible: boolean) => void;
  setCallStatus: (
    status: 'initiating' | 'ringing' | 'connected' | 'ended' | null
  ) => void;
  setIsOutgoingCall: (isOutgoing: boolean) => void;
  setActiveCallId: (id: number | null) => void;
  activeCallId: number | null;
  callStatus: 'initiating' | 'ringing' | 'connected' | 'ended' | null;
  isOutgoingCall: boolean;
}) {
  const handleCall = async () => {
    if (!otherUser || !currentUser || !token) return;

    try {
      setCallModalVisible(true);
      setCallStatus('initiating');
      setIsOutgoingCall(true);

      await startCall({
        callerId: currentUser.id,
        receiverId: Number(otherUser.user_id),
      });

      // The socket will handle subsequent state changes
    } catch (error) {
      console.error('Failed to initiate call:', error);
      Alert.alert('Error', 'Failed to initiate call. Please try again.');
      setCallModalVisible(false);
      setCallStatus(null);
    }
  };

  const handleAcceptCall = async () => {
    if (!socket || activeCallId === null) return;

    socket.emit('accept_call', { callId: activeCallId }, (response: any) => {
      if (response.error) {
        Alert.alert('Error', 'Failed to accept call');
        setCallModalVisible(false);
        setCallStatus(null);
      } else {
        setCallStatus('connected');
      }
    });
  };

  const handleRejectCall = async () => {
    if (!socket || activeCallId === null) {
      setCallModalVisible(false);
      setCallStatus(null);
      return;
    }

    try {
      if (isOutgoingCall) {
        // For outgoing calls, use end_call
        await endCall({ callId: activeCallId });
      } else {
        // For incoming calls, use reject_call
        socket.emit(
          'reject_call',
          { callId: activeCallId },
          (response: any) => {
            if (response.error) {
              console.error('Failed to reject call:', response.error);
              Alert.alert('Error', 'Failed to reject call');
            }
          }
        );
      }

      // Make sure we close the modal properly
      setCallStatus('ended');
      setTimeout(() => {
        setCallModalVisible(false);
        setCallStatus(null);
        setActiveCallId(null);
      }, MODAL_CLOSE_DELAY);
    } catch (error) {
      console.error('Failed to reject/end call:', error);
      Alert.alert('Error', 'Failed to end call');
      setCallModalVisible(false);
      setCallStatus(null);
      setActiveCallId(null);
    }
  };

  const handleEndCall = async () => {
    if (!socket || activeCallId === null) {
      setCallModalVisible(false);
      setCallStatus(null);
      return;
    }

    try {
      // Use the endCall function directly since it's for both outgoing and ongoing calls
      await endCall({ callId: activeCallId });

      // Set ended state but don't close modal yet - socket will handle this
      setCallStatus('ended');

      // Fallback in case socket doesn't handle it
      setTimeout(() => {
        if (callStatus !== null) {
          setCallModalVisible(false);
          setCallStatus(null);
          setActiveCallId(null);
        }
      }, 3000);
    } catch (error) {
      console.error('Failed to end call:', error);
      Alert.alert('Error', 'Failed to end call');
      setCallModalVisible(false);
      setCallStatus(null);
      setActiveCallId(null);
    }
  };

  return {
    handleCall,
    handleAcceptCall,
    handleRejectCall,
    handleEndCall,
  };
}
