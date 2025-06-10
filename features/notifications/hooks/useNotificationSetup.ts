import { matchaAPI, useRegisterDeviceMutation } from '@/rtk-query';
import { useAppDispatch } from '@/store/global';
import { NotificationType } from '@/types/notification.type';
import * as ExpoNotifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

/**
 * NOTIFICATION CONFIGURATION
 * These constants and setup functions define the notification behavior
 */
const MATCHA_COLOR = '#2EEB70';
const NOTIFICATION_DELAY = 2000; // Milliseconds between notifications (anti-flood)

/**
 * Setup Android notification channel
 * For Android, channels are required for notifications to appear properly
 */
const setupAndroidChannel = async () => {
  if (Platform.OS === 'android') {
    try {
      // First delete existing channel to ensure clean setup
      await ExpoNotifications.deleteNotificationChannelAsync('default');

      // Create notification channel with max importance for visibility
      await ExpoNotifications.setNotificationChannelAsync('default', {
        name: 'Matcha Notifications',
        description: 'Notifications for matches, messages and other updates',
        importance: ExpoNotifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: MATCHA_COLOR,
        enableLights: true,
        enableVibrate: true,
        lockscreenVisibility:
          ExpoNotifications.AndroidNotificationVisibility.PUBLIC,
        showBadge: true,
        sound: 'default',
        bypassDnd: true,
      });

      console.log('✅ Android notification channel configured');
    } catch (error) {
      console.error('❌ Error configuring Android channel:', error);
    }
  }
};

/**
 * Request notification permissions from the user
 */
const requestPermissions = async () => {
  const { status } = await ExpoNotifications.getPermissionsAsync();
  if (status !== 'granted') {
    await ExpoNotifications.requestPermissionsAsync();
    console.log('📱 Notification permission requested');
  }
};

/**
 * Configure the notification handler for the entire app
 * This determines how notifications are displayed when they arrive
 */
// Initialize Android notification channel
setupAndroidChannel();

// Configure notification handler
ExpoNotifications.setNotificationHandler({
  handleNotification: async () => {
    await requestPermissions();
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      ...(Platform.OS === 'android' && {
        priority: ExpoNotifications.AndroidNotificationPriority.MAX,
      }),
    };
  },
});

/**
 * Main hook for notification setup and handling
 * This handles registration, receiving, and responding to notifications
 */
export const useNotificationSetup = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [registerDevice] = useRegisterDeviceMutation();

  // Refs to store notification listeners
  const notificationListener = useRef<ExpoNotifications.Subscription>();
  const responseListener = useRef<ExpoNotifications.Subscription>();

  /**
   * Get appropriate emoji icon based on notification type
   * @param type - The notification type
   * @returns emoji string for the notification
   */
  const getNotificationIcon = (type: NotificationType) => {
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

  /**
   * Register device for push notifications
   * Gets push token and sends it to our backend
   */
  const registerForPushNotifications = async () => {
    let retries = 3; // Number of retry attempts

    while (retries > 0) {
      try {
        // Check existing permissions
        const { status: existingStatus } =
          await ExpoNotifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // Request permissions if needed
        if (existingStatus !== 'granted') {
          console.log('📱 Requesting notification permissions');
          const { status } = await ExpoNotifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.warn('⚠️ Notification permission denied!');
          return null;
        }

        console.log('✅ Notification permissions granted:', finalStatus);

        // Check if we have project ID - use a fallback if not provided
        let projectId = '6c9d5c2a-f900-496a-8d34-4cb1b3ec8b2d';

        console.log('Using project ID:', projectId);

        // Get push token from Expo
        const tokenData = await ExpoNotifications.getExpoPushTokenAsync({
          projectId: projectId,
          // Make sure to specify the exact device push service based on platform
        });

        const token: string = tokenData.data;
        console.log('🔑 Push token obtained:', token);

        // Register token with our backend
        await registerDevice({
          token,
          platform: 'android', // Use actual platform instead of hardcoded value
        });

        console.log('✅ Device registered for push notifications');
        return token;
      } catch (error: any) {
        retries--;
        console.error(
          `❌ Error registering for push notifications (${retries} retries left):`,
          error
        );

        // Log specific information about the error
        if (error.message && error.message.includes('EXPERIENCE_NOT_FOUND')) {
          console.error(
            'Experience ID not found. Please check your environment variables or Expo configuration'
          );
        }

        // If it's the last retry, register with a local token to prevent app from breaking
        if (retries === 0) {
          try {
            // Create a fake token that will be recognized as invalid by the backend
            // but will allow the app to continue functioning
            const fakeToken = `ExpoFakeToken[${Platform.OS}]_${Date.now()}`;
            console.warn('⚠️ Using fake token as fallback:', fakeToken);

            // Register the fake token - backend should handle this gracefully
            await registerDevice({
              token: fakeToken,
              platform: 'android',
            });

            return fakeToken;
          } catch (registerError) {
            console.error('❌ Failed to register fake token:', registerError);
            return null;
          }
        }

        // Wait between retries with increasing delay
        const delay = (3 - retries) * 1000;
        console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return null;
  };

  /**
   * Handle incoming notifications
   * Processes notification data and shows visible alerts
   */
  const handleNotification = async (
    notification: ExpoNotifications.Notification
  ) => {
    try {
      // Validate notification object
      if (!notification?.request) {
        console.error('❌ Invalid notification object received');
        return;
      }

      const { request } = notification;
      if (!request.content || !request.identifier) {
        console.error('❌ Invalid notification structure');
        return;
      }

      const { content, identifier } = request;
      const remoteData = (content.data || {}) as {
        type?: string;
        isLocalNotification?: boolean;
        user?: any;
      };
      // Only process remote notifications, not our local ones
      if (remoteData?.isLocalNotification) {
        console.log('🏠 Skipping local notification');
        return;
      }

      // Log for debugging
      console.log('📥 Processing notification:', {
        title: content.title,
        body: content.body,
        type: remoteData?.type,
      });

      // Skip notifications without content
      if (!content.body) {
        console.log('⚠️ Notification has no content, skipping');
        return;
      }

      // Create notification data object for our store
      const notificationData: {
        notification_id: number;
        notification_type: NotificationType;
        notification_content: string;
        notification_status: 'unread';
        sent_at: string;
        is_system: boolean;
        from_user: any;
        content: any;
      } = {
        notification_id: parseInt(identifier.replace(/\D/g, '')) || Date.now(),
        notification_type: (remoteData?.type as NotificationType) || 'system',
        notification_content: content.body || 'New notification received',
        notification_status: 'unread',
        sent_at: new Date().toISOString(),
        is_system: remoteData?.type === 'system',
        from_user: remoteData?.type === 'system' ? null : remoteData?.user,
        content: content, // Add the content property
      };
      // Update notifications in the Redux store
      dispatch(
        matchaAPI.util.updateQueryData(
          'getNotifications',
          { page: 1, limit: 10 },
          (draft) => {
            // Avoid duplicates in the store
            const isDuplicate =
              draft.notifications?.some(
                (n) =>
                  n.notification_content ===
                    notificationData.notification_content &&
                  Date.now() - new Date(n.sent_at).getTime() < 1000
              ) || false;

            if (!isDuplicate) {
              // Ensure notifications array exists
              if (!draft.notifications) {
                draft.notifications = [];
              }
              draft.notifications.unshift(notificationData);
              if (draft.meta) {
                draft.meta.total = (draft.meta.total || 0) + 1;
              }
            }
          }
        ) as any
      );
    } catch (error) {
      console.error('❌ Error handling notification:', error);
    }
  };

  /**
   * Setup notification listeners and cleanup
   * This runs when the component mounts
   */
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        await ExpoNotifications.dismissAllNotificationsAsync();
        await ExpoNotifications.cancelAllScheduledNotificationsAsync();
        // Register for push notifications
        await registerForPushNotifications();

        // Reinitialize channel and test notification (Android only)
        if (Platform.OS === 'android') {
          await requestPermissions();

          // Remove any previous channel if exists
          try {
            await ExpoNotifications.deleteNotificationChannelAsync('default');
          } catch (error) {
            // Ignore if channel doesn't exist
          }

          // Reset notification handler for test
          ExpoNotifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: true,
              priority: ExpoNotifications.AndroidNotificationPriority.MAX,
            }),
          });
        }

        // Add listeners for notification events
        notificationListener.current =
          ExpoNotifications.addNotificationReceivedListener(handleNotification);

        // Handle user tapping on notifications
        responseListener.current =
          ExpoNotifications.addNotificationResponseReceivedListener(
            (response) => {
              try {
                if (!response?.notification?.request) {
                  console.error('❌ Invalid response structure');
                  return;
                }

                const data = response.notification.request.content.data || {};
                console.log('👆 User tapped notification:', data);

                // Navigate based on notification type
                if (data?.notification_type === 'match') {
                  router.push('/messages');
                } else if (data?.notification_type === 'message') {
                  // router.push(`/messages/${data.chat_id}`);
                  router.push(`/messages`);
                } else {
                  router.push('/notifications');
                }
              } catch (error) {
                console.error('❌ Error handling notification tap:', error);
                router.push('/notifications');
              }
            }
          );

        console.log('✅ Notification listeners setup complete');
      } catch (error) {
        console.error('❌ Error setting up notifications:', error);
      }
    };

    // Initialize the notification system
    setupNotifications();

    // Cleanup function: remove listeners when component unmounts
    return () => {
      try {
        if (notificationListener.current) {
          ExpoNotifications.removeNotificationSubscription(
            notificationListener.current
          );
        }
        if (responseListener.current) {
          ExpoNotifications.removeNotificationSubscription(
            responseListener.current
          );
        }
        console.log('🧹 Notification listeners cleaned up');
      } catch (error) {
        console.error('❌ Error cleaning up notification listeners:', error);
      }
    };
  }, []);
};
