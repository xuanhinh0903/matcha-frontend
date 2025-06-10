import { Socket, io } from 'socket.io-client';
import React, { useCallback, useEffect, useRef, ReactNode } from 'react';
import {
  Message,
  MessageSocketEvents,
  SendMessageRequest,
} from '@/types/message.type';
import { useAppDispatch, useAppSelector } from '@/store/global';
import { showSuccessToast, showErrorToast } from '@/helpers/toast.helper';
import { messagesApi } from './index';
import { BASE_URL } from '@/constants';
import {
  websocketActions,
  isWebSocketConnected,
  getSocketStatus,
} from '@/store/global/websocket';
import { showMatchPopup } from '@/store/global/match';
import { useSegments } from 'expo-router';

// Create a singleton socket instance to be used app-wide
let globalSocketInstance: Socket | null = null;
let socketInitializationInProgress = false;
let socketInitPromise: Promise<Socket | null> | null = null;
// Track if event listeners have been initialized to prevent duplicate handlers
let listenersInitialized = false;

// Direct accessor functions for the global socket (can be used outside React context)
export const getGlobalSocket = (): Socket | null => globalSocketInstance;
export const setGlobalSocket = (socket: Socket | null): void => {
  globalSocketInstance = socket;
};

// Provider component for WebSocket (using Redux)
export const WebSocketProvider: React.FC<{
  children: ReactNode;
  token: string;
}> = ({ children, token }) => {
  const dispatch = useAppDispatch();
  const socketStatus = useAppSelector(getSocketStatus);
  const reconnectAttemptRef = useRef(0);
  const socketRef = useRef<Socket | null>(null);
  const [segments] = useSegments();
  const mountedRef = useRef(true);
  // Add a ref to track if event listeners were already set up
  const listenersSetupRef = useRef(false);

  // Function to check if current path is in auth flow
  const isInAuthFlow = useCallback(() => {
    try {
      return (
        segments.includes('/(auth)') || segments.includes('/not-verify-account')
      );
    } catch (error) {
      // If we can't determine the path, default to false
      return false;
    }
  }, []);

  // Initialize socket as a singleton with proper error handling
  const initializeSocket = useCallback(
    async (token: string): Promise<Socket | null> => {
      if (!token) return null;

      const inAuthFlow = isInAuthFlow();

      if (globalSocketInstance?.connected) {
        // If we already have a valid socket, just return it
        console.log(
          'Reusing existing connected socket:',
          globalSocketInstance.id
        );
        return globalSocketInstance;
      }

      // Disconnect any existing socket that's not properly connected
      if (globalSocketInstance) {
        console.log('Disconnecting stale socket before creating a new one');
        try {
          globalSocketInstance.disconnect();
        } catch (e) {
          console.error('Error disconnecting stale socket:', e);
        }
        globalSocketInstance = null;
        // Reset listeners initialization state
        listenersInitialized = false;
      }

      console.log('Creating new socket connection');
      socketInitializationInProgress = true;

      try {
        dispatch(websocketActions.setSocketStatus('connecting'));

        const newSocket = io(`${BASE_URL}/messages`, {
          extraHeaders: {
            Authorization: `Bearer ${token}`,
          },
          reconnection: true,
          reconnectionAttempts: inAuthFlow ? 3 : Infinity,
          reconnectionDelay: inAuthFlow ? 5000 : 1000,
          reconnectionDelayMax: inAuthFlow ? 30000 : 5000,
          timeout: 60000,
          transports: ['websocket', 'polling'],
          forceNew: false,
          auth: { token },
          autoConnect: true,
        });

        // Set up event listeners
        const setupSocketListeners = (socket: Socket) => {
          // Skip if listeners are already initialized on this socket instance
          if (listenersInitialized) {
            console.log('Socket listeners already initialized, skipping setup');
            return;
          }

          console.log('Setting up socket event listeners');

          // Debug flag to control verbose logging
          const DEBUG_PING = false;
          let pingCount = 0;

          socket.on('connect', () => {
            if (!mountedRef.current || isInAuthFlow()) return;
            console.log('✅ Socket connected successfully: WEB', socket.id);
            dispatch(websocketActions.setSocketStatus('connected'));
            dispatch(websocketActions.setSocketId(socket.id!));
            reconnectAttemptRef.current = 0;
            socket.emit('get_online_users');
          });

          socket.on('disconnect', (reason) => {
            if (!mountedRef.current) return;
            console.log('❌ Socket disconnected:', reason);
            dispatch(websocketActions.setSocketStatus('disconnected'));

            if (
              !inAuthFlow &&
              (reason === 'io server disconnect' ||
                reason === 'transport close')
            ) {
              setTimeout(() => {
                if (mountedRef.current && socket === globalSocketInstance) {
                  console.log(`Attempting manual reconnection after ${reason}`);
                  socket.connect();
                }
              }, 1000);
            }
          });

          socket.on('duplicate_connection', (data) => {
            if (!mountedRef.current) return;
            console.log('Duplicate connection detected:', data);

            // Check if we're just being replaced but should stay connected (for ongoing calls)
            if (data.action === 'replaced') {
              console.log(
                'This socket has been replaced but will remain connected for ongoing activities'
              );
              // We just continue without disconnecting, allowing calls to complete
              dispatch(websocketActions.setSocketStatus('replaced'));
            } else {
              // Old behavior - this socket is a duplicate and should be disconnected
              socket.disconnect();
            }
          });

          socket.on('connect_error', (error) => {
            if (!mountedRef.current) return;
            console.error('⚠️ Socket connection error:', error.message);
            dispatch(websocketActions.setSocketStatus('error'));
            reconnectAttemptRef.current++;

            if (inAuthFlow && reconnectAttemptRef.current > 3) {
              console.log(
                'In auth flow and exceeded reconnection attempts, stopping reconnection'
              );
              socket.disconnect();
            }
          });

          // Handle connection checks from server
          socket.on('connection_check', (data, callback) => {
            if (callback && typeof callback === 'function') {
              callback({ received: true, timestamp: Date.now() });
            }
          });

          socket.io.on('reconnect_attempt', (attempt) => {
            if (!mountedRef.current) return;
            console.log(`Socket reconnection attempt ${attempt}`);
            dispatch(websocketActions.setSocketStatus('connecting'));

            if (inAuthFlow && attempt > 3) {
              console.log(
                'In auth flow and exceeded reconnection attempts, stopping reconnection'
              );
              socket.disconnect();
            }
          });

          socket.io.on('reconnect', (attempt) => {
            if (!mountedRef.current) return;
            console.log(`Socket reconnected after ${attempt} attempts`);
            dispatch(websocketActions.setSocketStatus('connected'));
            reconnectAttemptRef.current = 0;
          });

          socket.io.on('reconnect_error', (error) => {
            if (!mountedRef.current) return;
            console.error('Socket reconnection error:', error.message);
            dispatch(websocketActions.setSocketStatus('error'));
          });

          socket.io.on('reconnect_failed', () => {
            if (!mountedRef.current) return;
            console.error('Socket reconnection failed after all attempts');
            dispatch(websocketActions.setSocketStatus('error'));
          });

          socket.on('pong', (latency) => {
            // Skip if component unmounted
            if (!mountedRef.current) return;

            // Ensure latency is a positive number - negative values indicate time sync issues
            const normalizedLatency =
              typeof latency === 'number' && latency > 0 ? latency : 0;
            if (DEBUG_PING || normalizedLatency > 200) {
              console.log(
                `Socket latency in Websocket provider: ${normalizedLatency}ms`
              );
            }
          });

          // Handle new messages from the server
          socket.on(
            'new_message',
            (receivedMessage: MessageSocketEvents['new_message']) => {
              if (!mountedRef.current) return;
              console.log('📩 Received new message:', receivedMessage);

              // Format the message with proper types
              const message: Message = {
                ...receivedMessage,
                sender: {
                  ...receivedMessage.sender,
                  user_id: Number(receivedMessage.sender.user_id),
                },
              };

              // Update the RTK Query cache with the new message
              dispatch(
                messagesApi.util.updateQueryData(
                  'getMessages',
                  { conversationId: message.conversation_id },
                  (draft) => {
                    if (!draft) return;

                    // Check if message already exists
                    const messageExists = draft.messages.some(
                      (m) => m.message_id === message.message_id
                    );

                    if (!messageExists) {
                      // Add the new message to the beginning
                      draft.messages.unshift(message);
                      draft.meta.total += 1;
                    }
                  }
                ) as any
              );

              // We no longer invalidate the conversations tag here
              // This will prevent refetching when receiving messages
            }
          );

          // Handle message read events
          socket.on(
            'message_read',
            ({ message_id, read_at }: MessageSocketEvents['message_read']) => {
              if (!mountedRef.current) return;
              // Just refresh the conversations list
              dispatch(messagesApi.util.invalidateTags(['Conversations']));
            }
          );

          // Handle new match events
          socket.on('new_match', (data: MessageSocketEvents['new_match']) => {
            if (!mountedRef.current) return;
            console.log('New match received:', data);

            // Refresh conversations list
            dispatch(messagesApi.util.invalidateTags(['Conversations']));

            // Show toast notification
            showSuccessToast(
              `You have a new match with ${data.otherUser.full_name}!`
            );
          });

          // Handle match details events - this is for the new async match pattern
          socket.on('match_details', (data: any) => {
            if (!mountedRef.current) return;
            console.log('Match details received:', data);

            // Prepare matched user data for the match popup
            const matchData = {
              matchId: data.matchId,
              isMatch: true,
              status: 'accepted',
              conversation_id: data.conversationId,
              matchedUser: {
                user_id: data.otherUser.user_id,
                full_name: data.otherUser.full_name,
                profile_picture: data.otherUser.profile_picture,
              },
            };

            // Dispatch an action to show the match popup
            dispatch(
              showMatchPopup({
                currentUserImage: '', // This will be populated from current user's profile
                matchedUser: {
                  name: data.otherUser.full_name || 'Your match',
                  image: data.otherUser.profile_picture || '',
                  conversationId: data.conversationId?.toString(),
                },
              })
            );

            // Refresh conversations list
            dispatch(messagesApi.util.invalidateTags(['Conversations']));
          });

          // Mark listeners as initialized to prevent duplicate setup
          listenersInitialized = true;
          listenersSetupRef.current = true;
        };

        // Setup all event listeners
        setupSocketListeners(newSocket);

        // Wait for the socket to connect with a timeout
        await new Promise<void>((resolve, reject) => {
          const connectTimeout = setTimeout(() => {
            reject(new Error('Socket connection timeout after 10 seconds'));
          }, 10000);

          newSocket.on('connect', () => {
            clearTimeout(connectTimeout);
            resolve();
          });

          newSocket.on('connect_error', (err) => {
            clearTimeout(connectTimeout);
            reject(err);
          });
        });

        // Set as global instance only once successfully connected
        globalSocketInstance = newSocket;

        return newSocket;
      } catch (error) {
        console.error('Socket initialization error:', error);
        dispatch(websocketActions.setSocketStatus('error'));
        return null;
      } finally {
        socketInitializationInProgress = false;
      }
    },
    [dispatch, isInAuthFlow]
  );

  useEffect(() => {
    mountedRef.current = true;

    // Skip if no token or in auth flow
    if (!token || isInAuthFlow()) return;

    // If socket is already connected, just use it
    if (globalSocketInstance?.connected) {
      console.log('Using existing connected socket:', globalSocketInstance.id);
      socketRef.current = globalSocketInstance;
      dispatch(websocketActions.setSocketId(globalSocketInstance?.id || ''));
      dispatch(websocketActions.setSocketStatus('connected'));
      return;
    }

    // If initialization is already in progress, wait for it to complete
    if (socketInitializationInProgress) {
      console.log('Socket initialization in progress, waiting...');
      if (socketInitPromise) {
        socketInitPromise.then((socket) => {
          if (socket && mountedRef.current) {
            socketRef.current = socket;
            dispatch(websocketActions.setSocketId(socket.id!));
          }
        });
      }
      return;
    }

    // Start new initialization with a short delay
    const initSocketTimer = setTimeout(() => {
      socketInitPromise = initializeSocket(token);
      socketInitPromise.then((socket) => {
        if (socket && mountedRef.current) {
          socketRef.current = socket;

          // Set up ping interval
          const pingInterval = setInterval(
            () => {
              if (!mountedRef.current) {
                clearInterval(pingInterval);
                return;
              }

              if (socket.connected) {
                socket.emit('ping', Date.now());
              } else if (socketStatus !== 'connecting' && !isInAuthFlow()) {
                socket.connect();
              }
            },
            isInAuthFlow() ? 60000 : 25000
          );

          // Clean up ping interval when component unmounts
          return () => {
            clearInterval(pingInterval);
          };
        }
      });
    }, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(initSocketTimer);
      // Don't disconnect the socket on unmount since it's globally shared
    };
  }, [token, initializeSocket, isInAuthFlow]);

  return <>{children}</>;
};

// Hook to use the WebSocket
export const useWebSocket = () => {
  const isConnected = useAppSelector(isWebSocketConnected);
  const socketStatus = useAppSelector(getSocketStatus);
  const socket = globalSocketInstance;

  return {
    socket,
    socketStatus,
    isConnected,
  };
};

// Hook for sending messages using WebSocket
export const useSendMessage = () => {
  const { socket } = useWebSocket();
  const dispatch = useAppDispatch();

  const sendMessage = async (message: SendMessageRequest): Promise<Message> => {
    if (!socket) {
      console.log('Socket not initialized yet, creating optimistic message');
      // Return optimistic message immediately for better UX
      const tempMessage: Message = {
        message_id: Date.now(),
        conversation_id: message.conversationId,
        content: message.content,
        content_type: message.contentType || 'text',
        sent_at: new Date().toISOString(),
        sender: {
          user_id: 0, // Will be updated when real message arrives
          full_name: '',
        },
      };

      // Try to reconnect socket in background
      setTimeout(() => {
        if (globalSocketInstance && !globalSocketInstance.connected) {
          globalSocketInstance.connect();
        }
      }, 500);

      return tempMessage;
    }

    if (!socket.connected) {
      console.log('Socket not connected, attempting to reconnect...');
      socket.connect();
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!socket.connected) {
        console.error('Still not connected after reconnection attempt');
        throw new Error('Unable to connect to server');
      }
    }

    console.log(
      `Sending message to conversation ${message.conversationId}: ${
        message.content
      } (${message.contentType || 'text'})`
    );

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        console.error('Message sending timed out after 10 seconds');
        reject(new Error('Message sending timed out after 10 seconds'));
      }, 10000);

      try {
        socket.emit(
          'send_message',
          {
            conversationId: message.conversationId,
            content: message.content,
            contentType: message.contentType || 'text',
          },
          (response: any) => {
            clearTimeout(timeoutId);
            console.log(
              'Message sent response:',
              JSON.stringify(response, null, 2)
            );

            if (response?.error) {
              console.error('Server returned error:', response.error);
              reject(new Error(response.error));
            } else if (response?.message) {
              const formattedMessage: Message = {
                ...response.message,
                sender: {
                  ...response.message.sender,
                  user_id: Number(response.message.sender.user_id),
                },
              };
              resolve(formattedMessage);
            } else if (response?.success) {
              const tempMessage: Message = {
                message_id: Date.now(),
                conversation_id: message.conversationId,
                content: message.content,
                content_type: message.contentType || 'text',
                sent_at: new Date().toISOString(),
                sender: {
                  user_id: 0,
                  full_name: '',
                },
              };
              resolve(tempMessage);
            } else {
              console.error('Unexpected response format:', response);
              reject(new Error('Invalid response from server'));
            }
          }
        );
      } catch (socketErr) {
        clearTimeout(timeoutId);
        console.error('Socket.emit threw an error:', socketErr);
        reject(socketErr);
      }
    });
  };

  const sendMessageMutation = async (
    message: SendMessageRequest
  ): Promise<Message> => {
    try {
      const result = await sendMessage(message);

      // Optimistically update the UI with the sent message
      dispatch(
        messagesApi.util.updateQueryData(
          'getMessages',
          { conversationId: message.conversationId },
          (draft) => {
            if (!draft) return;

            // Add optimistic message to the beginning
            draft.messages.unshift({
              ...result,
              message_id: result.message_id || Date.now(),
            });
            draft.meta.total += 1;
          }
        ) as any
      );

      // We no longer invalidate the conversations list here
      // This will prevent duplicate fetching when sending messages

      return result;
    } catch (error) {
      showErrorToast('Failed to send message');
      throw error;
    }
  };

  return { sendMessage: sendMessageMutation };
};
