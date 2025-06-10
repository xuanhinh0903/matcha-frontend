export interface Message {
  message_id: number;
  conversation_id: number;
  sender: {
    user_id: number;
    full_name: string;
  };
  content: string;
  content_type: string;
  sent_at: string;
  read_at?: string;
}

export interface Participant {
  user_id: number;
  full_name: string;
  photo_url?: string;
  is_online?: boolean;
  phone_number?: string;
  bio?: string;
  location?: string;
}

// Update MessageData interface to represent the message format
export interface MessageData {
  content: string;
  content_type: string;
  sent_at: string;
  read_at?: string;
}

export interface Conversation {
  conversation_id: number;
  participants?: Participant[]; // Optional for backward compatibility
  other_user?: {
    // For backward compatibility
    user_id: number;
    full_name: string | null;
    photo_url?: string | null;
    is_online?: boolean;
  };
  last_message?: MessageData;
  lastMessage?: MessageData;
  created_at?: string; // Optional for backward compatibility
}

export interface SendMessageRequest {
  conversationId: number;
  content: string;
  contentType?: string; // Can be 'text', 'image', etc.
}

export interface GetMessagesParams {
  conversationId: number;
  limit?: number;
  page?: number;
}

export interface GetMessagesResponse {
  messages: Message[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isBlocked?: boolean;
}

export interface GetConversationMediaParams {
  conversationId: number;
  limit?: number;
  page?: number;
}

export interface ConversationMediaResponse {
  media: Message[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchMessagesParams {
  conversationId: number;
  query: string;
  limit?: number;
  page?: number;
  enabled?: boolean;
}

export interface SearchMessagesResponse {
  messages: Message[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MessageSocketEvents {
  new_message: Message;
  message_read: {
    message_id: number;
    read_at: string;
  };
  new_match: {
    matchId: number;
    conversationId: number;
    otherUser: {
      user_id: number;
      full_name: string;
    };
  };
}
