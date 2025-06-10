import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../helpers/toast.helper';
import {
  CallSocketEvents,
  EndCallRequest,
  StartCallRequest,
  WebRTCSignalData,
} from '@/types/call.type';

// WebSocket hook for calls
export const useCallSocket = (token: string) => {
  const queryClient = useQueryClient();
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = React.useState<
    'connecting' | 'connected' | 'disconnected'
  >('disconnected');

  React.useEffect(() => {
    if (!token) return;

    // Connect to the messages namespace to match the backend
    const newSocket = io(`${process.env.EXPO_PUBLIC_API_URL}messages`, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    // Socket connection events
    newSocket.on('connect', () => {
      console.log('Connected to call websocket');
      setConnectionStatus('connected');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from call websocket:', reason);
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setConnectionStatus('disconnected');
    });

    // Call events
    newSocket.on(
      'call_initiated',
      (data: CallSocketEvents['call_initiated']) => {
        console.log('Call initiated received:', data);
        showSuccessToast(`Incoming call from ${data.caller.full_name}`);
      }
    );

    newSocket.on('call_accepted', (data: CallSocketEvents['call_accepted']) => {
      console.log('Call accepted received:', data);
      showSuccessToast(`Call accepted by ${data.receiver.full_name}`);
    });

    newSocket.on('call_rejected', (data: CallSocketEvents['call_rejected']) => {
      console.log('Call rejected received:', data);
      showSuccessToast(`Call rejected by ${data.receiver.full_name}`);
    });

    newSocket.on('call_ended', (data: CallSocketEvents['call_ended']) => {
      console.log('Call ended received:', data);
    });

    // WebRTC signaling events
    newSocket.on('webrtc_signal', (data: WebRTCSignalData) => {
      console.log('WebRTC signal received:', data.signal.type);
      // Signal events are handled in the CallScreen component
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [token]);

  const startCall = React.useCallback(
    async (callData: StartCallRequest) => {
      console.log('Starting call with data:', callData);
      if (!socket) {
        throw new Error('Socket not initialized');
      }
      try {
        // Make HTTP request to initiate the call
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}messages/call/${callData.receiverId}`,
          {
            callType: callData.callType || 'audio',
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('Error initiating call:', error);
        throw error;
      }
    },
    [socket, token]
  );

  const endCall = React.useCallback(
    async (callData: EndCallRequest) => {
      if (!socket) {
        throw new Error('Socket not initialized');
      }

      return new Promise((resolve, reject) => {
        socket.emit(
          'call_end',
          {
            callId: callData.callId,
            duration: callData.duration || 0,
          },
          (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve('Call ended successfully');
            }
          }
        );
      });
    },
    [socket]
  );

  const endAcceptedCall = React.useCallback(
    async (callData: EndCallRequest) => {
      if (!socket) {
        throw new Error('Socket not initialized');
      }

      return new Promise((resolve, reject) => {
        socket.emit(
          'call_end_accepted',
          {
            callId: callData.callId,
            duration: callData.duration || 0,
            conversationId: callData.conversationId,
            callType: callData.callType || 'audio',
          },
          (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve('Accepted call logged successfully');
            }
          }
        );
      });
    },
    [socket]
  );

  const sendWebRTCSignal = React.useCallback(
    async (data: WebRTCSignalData) => {
      if (!socket) {
        throw new Error('Socket not initialized');
      }

      return new Promise((resolve, reject) => {
        socket.emit('webrtc_signal', data, (response: any) => {
          if (response?.error) {
            reject(new Error(response.error));
          } else {
            resolve(response);
          }
        });
      });
    },
    [socket]
  );

  return {
    socket,
    connectionStatus,
    startCall,
    endCall,
    endAcceptedCall,
    sendWebRTCSignal,
  };
};

// React Query Hooks
export const useStartCall = (token: string) => {
  const { startCall } = useCallSocket(token);

  return useMutation({
    mutationFn: startCall,
    onSuccess: () => {
      console.log('Call started successfully');
    },
    onError: (error) => {
      console.error('Call failed to start:', error);
      showErrorToast('Failed to start call');
    },
  });
};

export const useEndCall = (token: string) => {
  const { endCall } = useCallSocket(token);

  return useMutation({
    mutationFn: endCall,
    onSuccess: () => {
      console.log('Call ended successfully');
    },
    onError: (error) => {
      console.error('Call failed to end:', error);
      showErrorToast('Failed to end call');
    },
  });
};

export const useEndAcceptedCall = (token: string) => {
  const { endAcceptedCall } = useCallSocket(token);

  return useMutation({
    mutationFn: endAcceptedCall,
    onSuccess: () => {
      console.log('Accepted call ended and logged successfully');
    },
    onError: (error) => {
      console.error('Failed to log accepted call:', error);
      showErrorToast('Failed to log call');
    },
  });
};

export const useWebRTCSignal = (token: string) => {
  const { sendWebRTCSignal } = useCallSocket(token);

  return useMutation({
    mutationFn: sendWebRTCSignal,
    onError: (error) => {
      console.error('WebRTC signal failed:', error);
    },
  });
};
