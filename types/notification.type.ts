export type NotificationType =
  | 'system'
  | 'like'
  | 'message'
  | 'match'
  | 'block';

export interface NotificationUser {
  user_id: number;
  full_name: string;
  profile_picture?: string;
}

export interface Notification {
  notification_id: number;
  notification_type: NotificationType;
  notification_content: string;
  notification_status: 'read' | 'unread';
  sent_at: string;
  is_system: boolean;
  from_user?: NotificationUser;
}

export interface NotificationResponse {
  notifications: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
