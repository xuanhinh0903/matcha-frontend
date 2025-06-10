import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';
import type { Notification } from '@/types/notification.type';
import { Avatar } from '@/features/shared/components/Avatar';
import { Ionicons } from '@expo/vector-icons';


interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
  onDelete: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'system':
      return '🔔';
    case 'like':
      return '👍';
    case 'match':
      return '❤️';
    case 'message':
      return '💬';
    case 'block':
      return '🚫';
    default:
      return '📬';
  }
};

const NotificationItem = memo<NotificationItemProps>(
  ({ notification, onPress, onDelete }) => {
    const isUnread = notification.notification_status === 'unread';
    const notificationIcon = getNotificationIcon(notification.notification_type);

    return (
      <TouchableOpacity
        style={[
          styles.container,
          isUnread && !notification.is_system && styles.unread,
        ]}
        onPress={onPress}
      >
        <View style={styles.content}>
          {!notification.is_system && (
            <Avatar
              imageUrl={notification.from_user?.profile_picture}
              size={40}
            />
          )}
          <View
            style={[
              styles.textContainer,
              notification.is_system && styles.systemTextContainer,
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.icon}>{notificationIcon}</Text>
              {notification.is_system ? (
                <Text style={styles.systemName}>System Notification</Text>
              ) : (
                <>
                  <Text style={styles.name}>
                    {notification.from_user?.full_name || 'Someone'}
                  </Text>
                  {notification.notification_type && (
                    <Text style={styles.notificationType}>
                      • {notification.notification_type}
                    </Text>
                  )}
                </>
              )}
            </View>
            <View style={styles.messageContainer}>
              <Text style={styles.messageContent}>
                {notification.notification_content}
              </Text>
              <Text style={styles.time}>
                {new Date(notification.sent_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Ionicons name="trash-outline" size={20} style={styles.deleteIcon} />
      </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.notification.notification_id ===
        nextProps.notification.notification_id &&
      prevProps.notification.notification_status ===
        nextProps.notification.notification_status
    );
  }
);

NotificationItem.displayName = 'NotificationItem';

export default NotificationItem;
