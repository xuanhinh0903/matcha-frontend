import {
  Conversation,
  ConversationMediaResponse,
  GetConversationMediaParams,
  GetMessagesParams,
  GetMessagesResponse,
  Message,
  MessageSocketEvents,
  Participant,
  SearchMessagesParams,
  SearchMessagesResponse,
  SendMessageRequest,
} from '../../types/message.type';
import { Socket, io } from 'socket.io-client';
import { showErrorToast, showSuccessToast } from '../../helpers/toast.helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import React from 'react';
import { client } from '../common/client';
import { getLatestToken } from '@/helpers';
import { router, useSegments } from 'expo-router';
import { ImagePickerAsset } from 'expo-image-picker';
import { ToastAndroid } from 'react-native';

// Query Keys
export const MESSAGES = {
  all: ['messages'] as const,
  lists: () => [...MESSAGES.all, 'list'] as const,
  list: (conversationId: number) =>
    [...MESSAGES.lists(), conversationId] as const,
};

export const CONVERSATIONS = {
  all: ['conversations'] as const,
  lists: () => [...CONVERSATIONS.all, 'list'] as const,
};

export const CONVERSATION_MEDIA = {
  all: ['conversation-media'] as const,
  lists: (conversationId: number) =>
    [...CONVERSATION_MEDIA.all, conversationId] as const,
};

// Search Messages functionality
export const CONVERSATION_SEARCH = {
  all: ['conversation-search'] as const,
  lists: (conversationId: number) =>
    [...CONVERSATION_SEARCH.all, conversationId] as const,
};

const searchMessages = async ({
  conversationId,
  query,
  limit,
  page = 1,
}: SearchMessagesParams): Promise<SearchMessagesResponse> => {
  console.log(
    `Searching messages for conversation ${conversationId} with query: "${query}"`
  );
  try {
    const { data } = await client.get(
      `/messages/conversation/${conversationId}/search`,
      {
        params: { query, page, limit },
      }
    );
    console.log('Search results:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error searching messages:', error);
    // Return empty results instead of throwing to prevent the UI from crashing
    return {
      messages: [],
      meta: {
        page: 1,
        limit: limit || 20,
        total: 0,
        totalPages: 0,
      },
    };
  }
};

export const useSearchMessages = (params: SearchMessagesParams) => {
  const queryEnabled =
    params.enabled !== false && !!params.query && params.query.length >= 1;
  console.log('Search query enabled:', queryEnabled, 'Query:', params.query);

  return useQuery({
    queryKey: CONVERSATION_SEARCH.lists(params.conversationId),
    queryFn: () => searchMessages(params),
    staleTime: 60000,
    enabled: queryEnabled,
    retry: 1, // Only retry once to avoid excessive failed requests
  });
};

interface OldConversationFormat {
  conversation_id: number;
  other_user: {
    user_id: number;
    full_name: string | null;
    photo_url?: string;
    is_online?: boolean;
  };
  last_message?: {
    content: string;
    content_type: string;
    sent_at: string;
    read_at?: string;
  };
}

const transformConversation = (
  conv: any,
  currentUserId?: number
): Conversation => {
  const participants: Participant[] = [
    {
      ...conv.other_user,
      user_id: conv.other_user.user_id,
      full_name: conv.other_user.full_name || 'Unknown User',
      photo_url: conv.other_user.photo_url, // Ensure photo_url is passed through
    },
  ];

  if (currentUserId) {
    participants.unshift({
      user_id: currentUserId,
      full_name: 'You',
    });
  }

  return {
    conversation_id: conv.conversation_id,
    participants,
    other_user: conv.other_user, // Preserve other_user for compatibility
    last_message: conv.last_message,
    lastMessage: conv.lastMessage || conv.last_message, // Handle both naming conventions
    created_at: new Date().toISOString(),
  };
};

const getConversations = async (): Promise<Conversation[]> => {
  const { data } = await client.get('/messages/conversations');
  const currentUser = await client.get('/user/info').then((res) => res.data);
  return data.map((conv: OldConversationFormat) =>
    transformConversation(conv, currentUser?.id)
  );
};

const getMessages = async ({
  conversationId,
  limit,
  page = 1,
}: GetMessagesParams): Promise<GetMessagesResponse> => {
  const { data } = await client.get(
    `/messages/conversation/${conversationId}`,
    {
      params: { page, limit },
    }
  );
  return data;
};

const getConversationMedia = async ({
  conversationId,
  limit,
  page = 1,
}: GetConversationMediaParams): Promise<ConversationMediaResponse> => {
  const { data } = await client.get(
    `/messages/conversation/${conversationId}/media`,
    {
      params: { page, limit },
    }
  );
  return data;
};

export const useConversationMedia = (params: GetConversationMediaParams) => {
  return useQuery({
    queryKey: CONVERSATION_MEDIA.lists(params.conversationId),
    queryFn: () => getConversationMedia(params),
    staleTime: 60000, // Media doesn't change as frequently as messages
  });
};

export const useMessageSocket = (token: string) => {
  const queryClient = useQueryClient();
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [socketStatus, setSocketStatus] = React.useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected');
  const reconnectAttemptRef = React.useRef(0);
  const socketRef = React.useRef<Socket | null>(null);
  const socketInitialized = React.useRef<boolean>(false);
  const [segments] = useSegments();
  // Function to check if current path is in auth flow
  const isInAuthFlow = React.useCallback(() => {
    try {
      // Get current URL path in Expo Router format
      // Check if the path is part of authentication or verification flow
      return (
        segments.includes('(auth)') || segments.includes('/not-verify-account')
      );
    } catch (error) {
      // If we can't determine the path, default to false
      return false;
    }
  }, []);

  const [attemptingReconnect, setAttemptingReconnect] = React.useState(0);

  React.useEffect(() => {
    if (!token || isInAuthFlow()) return;
    // Allow immediate component rendering by using a slight delay for socket initialization
    // This prevents blocking UI rendering while socket connection is established
    const initializeSocketWithDelay = setTimeout(() => {
      // Check if we're in the auth flow - if so, don't aggressively reconnect
      const inAuthFlow = isInAuthFlow();
      if (inAuthFlow) return;

      if (socketInitialized.current && (inAuthFlow || socketRef.current))
        // Don't initialize a new socket if already initialized or in auth flow with existing socket
        return;

      socketInitialized.current = true;

      // Clean up any existing socket connection to avoid duplicates
      if (socketRef.current) {
        console.log('Cleaning up existing socket connection...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }

    setSocketStatus('connecting');
      console.log('Initializing WebSocket connection...');

      const newSocket = io(`${process.env.EXPO_PUBLIC_API_URL}messages`, {
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnection: true,
        reconnectionAttempts: inAuthFlow ? 3 : Infinity, // Limit reconnection attempts in auth flow
        reconnectionDelay: inAuthFlow ? 5000 : 1000, // More delay in auth flow
        reconnectionDelayMax: inAuthFlow ? 30000 : 5000, // Much more delay in auth flow
        timeout: 60000,
        transports: ['websocket', 'polling'],
        forceNew: true,
        auth: { token },
        autoConnect: true,
      });

      // Debug flag to control verbose logging
      const DEBUG_PING = false;

      // Track ping count to reduce log frequency
      let pingCount = 0;

      newSocket.on('connect', () => {
        console.log('✅ Socket connected successfully: hoook', newSocket.id);
        setSocketStatus('connected');
        reconnectAttemptRef.current = 0;
        // Request online users immediately after connection
        newSocket.emit('get_online_users');
      });

      // Handle authentication errors from server
      newSocket.on('auth_error', async (error) => {
        console.log('🔑 Authentication error:', error);

        // Handle token expiration specifically
        if (error.type === 'token_expired') {
          console.log('Token expired, attempting to refresh token');

          try {
            // Logout the user if token is not found
            console.log('Token not found, logging out user');
            // Optionally, you can redirect to login or show a message
            // Redirect to login or show a message
            showErrorToast('Session expired. Please log in again.');
            newSocket.disconnect();
            router.push('/login'); // Adjust this based on your routing library
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            // Don't attempt any reconnection or token refresh when token isn't found
            socketInitialized.current = false;
            newSocket.disconnect();
            socketRef.current = null;
            router.push('/login'); // Adjust this based on your routing library
            // No redirection to login - just disconnect and do nothing as requested
          }
        } else {
          console.error('Socket authentication error:', error.message);
          setSocketStatus('error');
          newSocket.disconnect();
          router.push('/login'); // Adjust this based on your routing library
        }
      });

      newSocket.on('disconnect', (reason) => {
        if (attemptingReconnect > 3) return;
        console.log('❌ Socket disconnected:', reason);
        setSocketStatus('disconnected');

        // Only attempt reconnect if not in auth flow or if critical disconnect
        if (
          !inAuthFlow &&
          (reason === 'io server disconnect' || reason === 'transport close')
        ) {
          setTimeout(() => {
            console.log(`Attempting manual reconnection after ${reason}`);
            setAttemptingReconnect((prev) => prev + 1);
            newSocket.connect();
          }, 1000);
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('⚠️ Socket connection error:', error.message);
        setSocketStatus('error');
        reconnectAttemptRef.current++;

        // In auth flow, after a few attempts, stop trying to avoid repeated errors
        if (inAuthFlow && reconnectAttemptRef.current > 3) {
          console.log(
            'In auth flow and exceeded reconnection attempts, stopping reconnection'
          );
          newSocket.disconnect();
          socketRef.current = null;
          socketInitialized.current = false;
        }
      });

      // Handle connection checks from server
      newSocket.on('connection_check', (data, callback) => {
        console.log('Received connection check from server:', data);
        if (callback && typeof callback === 'function') {
          callback({ received: true, timestamp: Date.now() });
        }
      });

      newSocket.io.on('reconnect_attempt', (attempt) => {
        console.log(`Socket reconnection attempt ${attempt}`);
        setSocketStatus('connecting');

        // In auth flow, limit reconnection attempts to prevent console spam
        if (inAuthFlow && attempt > 3) {
          console.log(
            'In auth flow and exceeded reconnection attempts, stopping reconnection'
          );
          newSocket.disconnect();
        }
      });

      newSocket.io.on('reconnect', (attempt) => {
        if (attemptingReconnect > 3) return;
        console.log(`Socket reconnected after ${attempt} attempts`);
        setSocketStatus('connected');
        reconnectAttemptRef.current = 0;
      });

      newSocket.io.on('reconnect_error', (error) => {
        if (attemptingReconnect > 3) return;

        console.error('Socket reconnection error:', error.message);
        setSocketStatus('error');
      });

      newSocket.io.on('reconnect_failed', () => {
        if (attemptingReconnect > 3) return;

        console.error('Socket reconnection failed after all attempts');
        setSocketStatus('error');
      });

      newSocket.on('pong', (latency) => {
        // Ensure latency is a positive number - negative values indicate time sync issues
        const normalizedLatency =
          typeof latency === 'number' && latency > 0 ? latency : 0;
        console.log(
          `Socket latency in useMessageSocket: ${normalizedLatency}ms`
        );
      });

      newSocket.on(
        'new_message',
        async (receivedMessage: MessageSocketEvents['new_message']) => {
          console.log('📩 Received new message:', receivedMessage);
          const message: Message = {
            ...receivedMessage,
            sender: {
              ...receivedMessage.sender,
              user_id: Number(receivedMessage.sender.user_id),
            },
          };
          try {
            const messageQueryKey = MESSAGES.list(message.conversation_id);
            await queryClient.cancelQueries({ queryKey: messageQueryKey });
            queryClient.setQueryData<GetMessagesResponse>(
              messageQueryKey,
              (old) => {
                if (!old) {
                  return {
                    messages: [message],
                    meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
                  };
                }

                // Enhanced deduplication logic
                const messageExists = old.messages.some((m) => {
                  // Check by message_id if available
                  if (
                    m.message_id === message.message_id &&
                    message.message_id
                  ) {
                    return true;
                  }

                  // Check for optimistic messages with similar content
                  if (
                    m.content === message.content &&
                    m.sender.user_id === message.sender.user_id
                  ) {
                    // Check for messages sent within last 2 minutes (allowing for time sync issues)
                    const messageTime = new Date(m.sent_at).getTime();
                    const currentTime = Date.now();
                    return Math.abs(messageTime - currentTime) < 120000; // 2 minutes
                  }

                  // Check for temp messages (generated with timestamp as ID)
                  if (
                    !isNaN(m.message_id) &&
                    m.message_id > Date.now() - 300000 &&
                    m.content === message.content
                  ) {
                    return true;
                  }

                  return false;
                });

                if (messageExists) {
                  // Replace the optimistic message with the real one
                  return {
                    ...old,
                    messages: old.messages.map((m) => {
                      // Replace by message_id if it matches
                      if (
                        m.message_id === message.message_id &&
                        message.message_id
                      ) {
                        return message;
                      }

                      // Replace optimistic messages with similar content
                      if (
                        m.content === message.content &&
                        m.sender.user_id === message.sender.user_id &&
                        Math.abs(new Date(m.sent_at).getTime() - Date.now()) <
                          120000
                      ) {
                        return message;
                      }

                      // Replace temp messages
                      if (
                        !isNaN(m.message_id) &&
                        m.message_id > Date.now() - 300000 &&
                        m.content === message.content
                      ) {
                        return message;
                      }

                      return m;
                    }),
                  };
                }

                return {
                  ...old,
                  messages: [message, ...old.messages],
                  meta: { ...old.meta, total: old.meta.total + 1 },
                };
              }
            );
            console.log('Refetching conversations list after new message');
            await queryClient.refetchQueries({
              queryKey: CONVERSATIONS.lists(),
              exact: true,
            });
          } catch (error) {
            console.error('Error updating cache with new message:', error);
          }
        }
      );

      // newSocket.on(
      //   'message_read',
      //   async ({
      //     message_id,
      //     read_at,
      //   }: MessageSocketEvents['message_read']) => {
      //     try {
      //       // Only refetch conversations list instead of resetting/invalidating everything
      //       await queryClient.refetchQueries({
      //         queryKey: CONVERSATIONS.lists(),
      //         exact: true,
      //       });
      //     } catch (error) {
      //       console.error('Error refreshing data after message_read:', error);
      //     }
      //   }
      // );

      // newSocket.on(
      //   'new_match',
      //   async (data: MessageSocketEvents['new_match']) => {
      //     console.log('New match received:', data);
      //     try {
      //       // Just refetch the conversations list instead of multiple operations
      //       await queryClient.refetchQueries({
      //         queryKey: CONVERSATIONS.lists(),
      //         exact: true,
      //       });

      //       showSuccessToast(
      //         `You have a new match with ${data.otherUser.full_name}!`
      //       );
      //     } catch (error) {
      //       console.error('Error refreshing data after new_match:', error);
      //     }
      //   }
      // );

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Use less aggressive ping interval in auth flow
      const pingInterval = setInterval(
        () => {
          if (newSocket.connected) {
            // Only log every 5th ping or when debug is enabled
            pingCount++;
            if (DEBUG_PING || pingCount % 5 === 0) {
              console.log(`Ping check #${pingCount}`);
            }

            const startTime = Date.now();
            newSocket.emit('ping', startTime);
          } else if (socketStatus !== 'connecting' && !inAuthFlow) {
            // Only attempt reconnect outside auth flow
            console.log(
              'Socket disconnected during ping check, attempting reconnect...'
            );
            newSocket.connect();
          }
        },
        inAuthFlow ? 60000 : 25000
      ); // Less frequent pings in auth flow

      return () => {
        console.log('Cleaning up socket connection');
        clearInterval(pingInterval);
        clearTimeout(initializeSocketWithDelay);
        newSocket.disconnect();
        socketRef.current = null;
        socketInitialized.current = false;
      };
    }, 100); // Small delay to allow rendering to complete first

    return () => {
      clearTimeout(initializeSocketWithDelay);
    };
  }, [token, queryClient]);

  const sendMessage = React.useCallback(
    async (message: SendMessageRequest): Promise<Message> => {
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
          if (socketRef.current && !socketRef.current.connected) {
            socketRef.current.connect();
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
    },
    [socket]
  );

  return {
    socket,
    sendMessage,
    socketStatus,
    isConnected: socketStatus === 'connected',
  };
};

export const useConversations = () => {
  return useQuery({
    queryKey: CONVERSATIONS.lists(),
    queryFn: getConversations,
    staleTime: 60000, // Increased from 10s to 60s
    refetchInterval: 30000, // Increased from 15s to 30s
    refetchOnWindowFocus: false, // Only refetch on demand or interval
    retry: 1, // Limit retry attempts
  });
};

export const useMessages = (params: GetMessagesParams) => {
  return useQuery({
    queryKey: MESSAGES.list(params.conversationId),
    queryFn: () => getMessages(params),
    staleTime: 60000, // Increase from 30000 to 60000 ms
    refetchOnMount: true, // Load fresh data when component mounts
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1, // Limit retries
    refetchIntervalInBackground: false,
    // Apply optimized pagination strategy
    select: (data) => {
      // Sort messages by timestamp to ensure proper ordering
      if (data.messages) {
        return {
          ...data,
          messages: data.messages.sort((a, b) => {
            return (
              new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
            );
          }),
        };
      }
      return data;
    },
  });
};

export const useSendMessage = (token: string) => {
  // const queryClient = useQueryClient();
  const { sendMessage } = useMessageSocket(token);
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: async (newMessage: Message) => {
      console.log('Message sent successfully:', newMessage);
      // await queryClient.invalidateQueries({
      //   queryKey: CONVERSATIONS.lists(),
      //   exact: true,
      // });
    },
  });
};

// Delete conversation API endpoint
interface DeleteConversationParams {
  conversationId: number;
}

const deleteConversation = async ({
  conversationId,
}: DeleteConversationParams): Promise<void> => {
  await client.delete(`/messages/conversation/${conversationId}`);
};

export const useDeleteConversation = (token: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: async () => {
      // Invalidate conversations list to refresh after deletion
      await queryClient.invalidateQueries({
        queryKey: CONVERSATIONS.lists(),
        exact: true,
      });
    },
  });
};

// Re
// Report user API endpoint
interface ReportUserParams {
  reportedUserId: number;
  reportReason:
    | 'fake_profile'
    | 'inappropriate_content'
    | 'harassment'
    | 'other';
  details?: string;
  files?: ImagePickerAsset[];
}

const reportUser = async (
  params: ReportUserParams
): Promise<{ success: boolean; message: string }> => {
  // Convert params to FormData for multipart upload
  const formData = new FormData();
  formData.append('reportedUserId', String(params.reportedUserId));
  formData.append('reportReason', params.reportReason);
  if (params.details) {
    formData.append('details', params.details);
  }
  if (params.files && params.files.length > 0) {
    params.files.forEach((asset, idx) => {
      const uri = asset.uri;
      const name = uri.split('/').pop() || `file_${idx}`;
      const ext = name.split('.').pop()?.toLowerCase() || 'jpg';
      const type =
        ext === 'png'
          ? 'image/png'
          : ext === 'gif'
          ? 'image/gif'
          : 'image/jpeg';
      formData.append('files', { uri, name, type } as any);
    });
  }

  const { data } = await client.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const useReportUser = () => {
  return useMutation({
    mutationFn: reportUser,
    onSuccess: () => {
      showSuccessToast('User reported successfully');
    },
    onError: (error: any) => {
      showErrorToast(error?.message || 'Failed to report user');
    },
  });
};

// ... rest of file unchanged
