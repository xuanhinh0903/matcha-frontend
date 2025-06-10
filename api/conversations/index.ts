import { useQuery } from '@tanstack/react-query';

import { client } from '../common/client';

// Type definitions
export interface ConversationData {
  conversation_id: number;
  created_at: string;
  other_user: {
    user_id: number;
    full_name: string;
    photo_url: string | null;
    is_online: boolean;
  };
  current_user: {
    user_id: number;
  };
}

export interface ConversationProfile {
  user_id: number;
  full_name: string;
  age?: number;
  gender?: string;
  bio?: string;
  is_online: boolean;
  distance?: number;
  last_active?: string;
  photos?: Array<{
    photo_id: number;
    photo_url: string;
    is_profile_picture?: boolean;
  }>;
  interests?: string[];
  match_stats?: {
    totalMatches: number;
    likesReceived: number;
    matchRate: number;
  };

  // Privacy visibility flags
  show_photos: boolean;
  show_bio: boolean;
  show_age: boolean;
  show_interests: boolean;
  show_match_stats: boolean;
}

// Fetch conversation by ID
export const fetchConversation = async (
  conversationId: number,
  token: string
): Promise<ConversationData> => {
  const response = await client.get(`/conversations/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Fetch conversation profile
export const fetchConversationProfile = async (
  conversationId: number,
  userId: number,
  token: string
): Promise<ConversationProfile> => {
  const response = await client.get(
    `/conversations/${conversationId}/profile/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// React Query hook for conversation data
export const useConversation = (conversationId: number, token: string) => {
  console.log('Fetching conversation with ID:', conversationId);
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => fetchConversation(conversationId, token),
    enabled: !!conversationId && !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// React Query hook for conversation profile data
export const useConversationProfile = (
  conversationId: number,
  userId: number,
  token: string
) => {
  return useQuery({
    queryKey: ['conversationProfile', conversationId, userId],
    queryFn: () => fetchConversationProfile(conversationId, userId, token),
    enabled: !!conversationId && !!userId && !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
