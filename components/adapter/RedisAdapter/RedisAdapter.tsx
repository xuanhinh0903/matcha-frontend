import { getAuthToken } from '@/store/global/auth/auth.slice';
import { router, useSegments } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';

type Message = {
  userId: string;
  message: string;
  timestamp: string;
  instanceId: string;
};

// Track processed call IDs globally to avoid duplicate call screens
const processedCallIds = new Set<string>();

const RedisAdapter = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const token = useSelector(getAuthToken);
  const socketInitializedRef = useRef(false);

  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [segments] = useSegments();

  useEffect(() => {
    console.log('Initializing Redis adapter useEffect...');
    // Prevent multiple socket initializations
    if (
      socketInitializedRef.current ||
      segments === '(auth)' ||
      segments === '(admin)'
    ) {
      return;
    }

    socketInitializedRef.current = true;

    const setupSocket = async () => {
      try {
        if (!token) {
          return;
        }

        console.log('Setting up Redis adapter socket connection...');
        const newSocket = io(`${process.env.EXPO_PUBLIC_API_URL}messages`, {
          extraHeaders: {
            Authorization: `Bearer ${token}`,
          },
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          autoConnect: true,
          forceNew: false, // Use existing connection if available
          transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
        });

        // Add connection state tracking and logging
        let isInitialConnection = true;

        newSocket.on('connect', () => {
          console.log('✅ Redis adapter socket connected:', newSocket.id);

          // On reconnection, re-register for notifications if needed
          if (!isInitialConnection) {
            console.log(
              'Redis adapter reconnected, refreshing notification registration'
            );
            // Re-register for push notifications or any other necessary setup
          }
          isInitialConnection = false;
        });

        newSocket.on('disconnect', (reason) => {
          console.log('❌ Redis adapter socket disconnected:', reason);
          // Auto reconnect for certain disconnect reasons
          if (
            reason === 'io server disconnect' ||
            reason === 'transport close'
          ) {
            console.log(
              'Redis adapter attempting reconnection after server disconnect'
            );
            setTimeout(() => newSocket.connect(), 1000);
          }
        });

        newSocket.on('connect_error', (error) => {
          console.log("🚀 ~ newSocket.on ~ error:", error)
          console.error('⚠️ Redis adapter socket error:', error.message);
          // Retry connection with exponential backoff
          setTimeout(() => {
            if (!newSocket.connected) newSocket.connect();
          }, 2000);
        });

        // Listen for redis_broadcast events
        newSocket.on('redis_broadcast', (data: Message) => {
          console.log('📥 Received redis broadcast:', data);
        });

        // Listen for call notifications
        newSocket.on('call_received', (data) => {
          console.log('📞 Redis adapter received call:', JSON.stringify(data));

          // Reset the processed call set if it gets too large (memory management)
          if (processedCallIds.size > 50) {
            console.log('Clearing processed call ID cache');
            processedCallIds.clear();
          }

          // Check if we're already processing this call (prevent duplicates)
          if (processedCallIds.has(data.callId)) {
            console.log(
              `📞 Call ${data.callId} already being processed, ignoring duplicate`
            );
            return;
          }

          console.log(
            `📞 Call received from: ${data.caller.full_name} (ID: ${data.caller.user_id})`
          );

          // Mark this call as processed
          processedCallIds.add(data.callId);
          setCurrentCallId(data.callId);
          console.log(' data.caller', data.caller);
          // Force a small delay to ensure all components are ready
          setTimeout(() => {
            // Navigate to the dedicated incoming call screen using replace to avoid stacking
            router.replace({
              pathname: '/(call)',
              params: {
                userId: data.caller.user_id.toString(),
                userName: data.caller.full_name || 'Unknown User',
                userAvatar:
                  data.caller.photo_url || 'https://picsum.photos/200',
                callType: data.callType || 'audio',
                callId: data.callId.toString(),
                conversationId: data.conversationId
                  ? data.conversationId.toString()
                  : '',
                fromNotification: 'true',
              },
            });
          }, 300);
        });

        // Track call state changes for record keeping
        newSocket.on('call_accepted', (data) => {
          console.log('Call accepted:', data);
          if (data.callId === currentCallId) {
            console.log('Call accepted:', data);
          }
        });

        newSocket.on('call_rejected', (data) => {
          console.log('Call rejected:', data);
          if (data.callId === currentCallId) {
            setCurrentCallId(null);
            // Remove from processed calls so it can be received again in the future
            processedCallIds.delete(data.callId);
          }
        });

        newSocket.on('call_ended', (data) => {
          console.log('Call ended:', data);
          if (data.callId === currentCallId) {
            setCurrentCallId(null);
            // Remove from processed calls so it can be received again in the future
            processedCallIds.delete(data.callId);
          }
        });

        setSocket(newSocket);

        return () => {
          newSocket.disconnect();
        };
      } catch (error) {
        console.error('Error setting up socket:', error);
      }
    };

    setupSocket();

    return () => {
      if (
        segments === 'login' ||
        segments === 'signup' ||
        segments === 'not-verify-account'
      )
        return;
      if (socket) {
        socket.disconnect();
      }
      socketInitializedRef.current = false;
    };
  }, [token]);

  return (
    <></> // No need to render anything
  );
};

export default RedisAdapter;
