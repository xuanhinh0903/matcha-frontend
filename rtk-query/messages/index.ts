import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '@/constants';
import {
  Message,
  Conversation,
  GetMessagesParams,
  GetMessagesResponse,
  SendMessageRequest,
  GetConversationMediaParams,
  ConversationMediaResponse,
  SearchMessagesParams,
  SearchMessagesResponse,
} from '@/types/message.type';
import { prepareHeadersWithToken } from '../utils';

export const messagesApi = createApi({
  reducerPath: 'messagesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: prepareHeadersWithToken,
  }),
  tagTypes: ['Conversations', 'Messages', 'ConversationMedia'],
  endpoints: (builder) => ({
    // Get all conversations
    getConversations: builder.query<Conversation[], void>({
      query: () => '/messages/conversations',
      transformResponse: async (response: any) => {
        // Get current user info to properly format participants
        const userResponse = await fetch(`${BASE_URL}/user/info`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const currentUser = await userResponse.json();

        // Transform conversations to add participants
        return response.map((conv: any) => {
          const participants = [
            {
              ...conv.other_user,
              user_id: conv.other_user.user_id,
              full_name: conv.other_user.full_name || 'Unknown User',
              photo_url: conv.other_user.photo_url,
            },
          ];

          if (currentUser?.id) {
            participants.unshift({
              user_id: currentUser.id,
              full_name: 'You',
            });
          }

          return {
            conversation_id: conv.conversation_id,
            participants,
            other_user: conv.other_user,
            last_message: conv.last_message,
            lastMessage: conv.lastMessage || conv.last_message,
            created_at: new Date().toISOString(),
          };
        });
      },
      providesTags: ['Conversations'],
    }),

    // Get messages for a conversation
    getMessages: builder.query<GetMessagesResponse, GetMessagesParams>({
      query: ({ conversationId, limit, page = 1 }) => ({
        url: `/messages/conversation/${conversationId}`,
        params: { page, limit },
      }),
      transformResponse: (response: GetMessagesResponse) => {
        // Ensure messages are sorted by sent_at in descending order
        if (response.messages) {
          return {
            ...response,
            messages: response.messages.sort((a, b) => {
              return (
                new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
              );
            }),
          };
        }
        return response;
      },
      providesTags: (result, error, arg) => [
        { type: 'Messages', id: arg.conversationId },
      ],
    }),

    // Get media for a conversation
    getConversationMedia: builder.query<
      ConversationMediaResponse,
      GetConversationMediaParams
    >({
      query: ({ conversationId, limit, page = 1 }) => ({
        url: `/messages/conversation/${conversationId}/media`,
        params: { page, limit },
      }),
      providesTags: (result, error, arg) => [
        { type: 'ConversationMedia', id: arg.conversationId },
      ],
    }),

    // Search messages in a conversation
    searchMessages: builder.query<SearchMessagesResponse, SearchMessagesParams>(
      {
        query: ({ conversationId, query, limit, page = 1 }) => ({
          url: `/messages/conversation/${conversationId}/search`,
          params: { query, page, limit },
        }),
        // Return empty results instead of failing on error
        transformErrorResponse: (error) => {
          console.error('Error searching messages:', error);
          return {
            messages: [],
            meta: {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 0,
            },
          };
        },
        // Only execute the query when there's a search term
        keepUnusedDataFor: 60, // Keep data for 60 seconds
      }
    ),

    // Delete a conversation
    deleteConversation: builder.mutation<void, number>({
      query: (conversationId) => ({
        url: `/messages/conversation/${conversationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Conversations'],
    }),

    // Report a user
    reportUser: builder.mutation<
      { success: boolean; message: string },
      {
        reportedUserId: number;
        reportReason:
          | 'fake_profile'
          | 'inappropriate_content'
          | 'harassment'
          | 'other';
        details?: string;
      }
    >({
      query: (body) => ({
        url: '/reports',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useGetConversationMediaQuery,
  useSearchMessagesQuery,
  useDeleteConversationMutation,
  useReportUserMutation,
} = messagesApi;
