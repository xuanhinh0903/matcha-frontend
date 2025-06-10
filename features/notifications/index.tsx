import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
} from '@/rtk-query';
import React from 'react';
import { useRef, useCallback, useEffect, useState } from 'react';
import { Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import NotificationItem from './components/NotificationItem';
import { useNotificationSetup } from './hooks/useNotificationSetup';
import { styles } from './styles';
import HeartIcon from '@/assets/images/icon.png';
import type { Notification } from '@/types/notification.type';

const MATCHA_COLOR = '#2EEB70';

interface EmptyNotificationsProps {
  refreshing: boolean;
  onRefresh: () => void;
}

const EmptyNotifications: React.FC<EmptyNotificationsProps> = ({
  refreshing,
  onRefresh,
}) => (
  <ScrollView
    contentContainerStyle={styles.emptyContainer}
    refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={MATCHA_COLOR}
        colors={[MATCHA_COLOR]}
      />
    }
  >
    <Image source={HeartIcon} style={styles.emptyIcon} resizeMode="contain" />
    <Text style={styles.emptyTitle}>No Notifications Yet</Text>
    <Text style={styles.emptyText}>
      When someone likes you or you get a match,{'\n'}
      you'll see it right here!
    </Text>
  </ScrollView>
);

const ItemSeparator = () => <View style={styles.separator} />;

const Header: React.FC<{
  hasUnread: boolean;
  onMarkAllRead: () => void;
  onFilter: () => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
}> = ({ hasUnread, onMarkAllRead, onFilter, searchQuery, onSearchChange }) => (
  <View style={styles.header}>
    <View style={styles.headerTop}>
      <Text style={styles.headerTitle}>Notifications</Text>
      <View style={styles.headerActions}>
        {hasUnread && (
          <TouchableOpacity style={styles.headerButton} onPress={onMarkAllRead}>
            <Text style={styles.headerButtonText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.headerButton} onPress={onFilter}>
          <Text style={styles.headerButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>
    </View>
    <View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={20} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search notifications..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={onSearchChange}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => onSearchChange('')}
        >
          <Ionicons name="close-circle" size={18} style={styles.clearIcon} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);
const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'system', label: 'System' },
  { id: 'user', label: 'User' },
] as const;

type FilterType = (typeof filterOptions)[number]['id'];

const NotificationsScreen = () => {
  // State hooks
  const [page, setPage] = React.useState(1);
  const [showFilterModal, setShowFilterModal] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<FilterType>('all');
  const [allNotifications, setAllNotifications] = React.useState<
    Notification[]
  >([]);

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Feature hooks
  useNotificationSetup();

  // API hooks
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllNotificationsAsRead] = useMarkAllNotificationsAsReadMutation();
  const { data, isLoading, isFetching, refetch } = useGetNotificationsQuery(
    {
      page,
      limit: 10,
    },
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  const [deleteNotification] = useDeleteNotificationMutation();

  const handleDelete = useCallback(
    (notificationId: number) => {
      console.log('Delete button clicked for notification ID:', notificationId);
      Alert.alert(
        'Delete Notification',
        'Are you sure you want to delete this notification?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log(
                  'Attempting to delete notification with ID:',
                  notificationId
                );
                const result = await deleteNotification({
                  id: notificationId.toString(),
                });
                console.log('Delete notification result:', result);
                refetch();
              } catch (error) {
                console.error('Error deleting notification:', error);
              }
            },
          },
        ]
      );
    },
    [deleteNotification, refetch]
  );

  // Update allNotifications when new data arrives
  React.useEffect(() => {
    if (data?.notifications) {
      if (page === 1) {
        setAllNotifications(data.notifications);
      } else {
        setAllNotifications((prev) => {
          const newIds = new Set(
            data.notifications.map((n) => n.notification_id)
          );
          const filteredPrev = prev.filter(
            (n) => !newIds.has(n.notification_id)
          );
          return [...filteredPrev, ...data.notifications];
        });
      }
    }
  }, [data?.notifications, page]);

  // Memoized values
  const notifications = React.useMemo<Notification[]>(() => {
    let filtered = [...allNotifications];
    // Apply search filter
    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (notification) =>
          notification.notification_content?.toLowerCase().includes(query) ||
          notification.from_user?.full_name?.toLowerCase().includes(query) ||
          notification.sent_at?.toLowerCase().includes(query)
      );
    }
    // Apply filters
    switch (activeFilter) {
      case 'system':
        return filtered.filter((n) => n.is_system);
      case 'user':
        return filtered.filter((n) => !n.is_system);
      default:
        return filtered;
    }
  }, [allNotifications, activeFilter, debouncedQuery]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Thêm useEffect mới để theo dõi searchQuery
  useEffect(() => {
    if (!searchQuery) {
      // Reset khi searchQuery rỗng
      setPage(1);
      setActiveFilter('all');
      refetch();
    }
  }, [searchQuery, refetch]);
  // Thêm handler cho search
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const hasUnreadNotifications = React.useMemo(() => {
    return notifications.some((n) => n.notification_status === 'unread');
  }, [notifications]);

  // Event handlers
  const handleLoadMore = React.useCallback(() => {
    if (data?.meta && !isFetching && data.meta.page < data.meta.totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [data?.meta, isFetching]);

  const handleRefresh = React.useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const handleNotificationPress = React.useCallback(
    async (notificationId: number) => {
      try {
        await markAsRead({ id: notificationId.toString() });
        refetch();
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    [markAsRead, refetch]
  );

  const handleMarkAllRead = React.useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      refetch();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [markAllNotificationsAsRead, refetch]);

  const handleFilter = React.useCallback(() => {
    setShowFilterModal(true);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header
          hasUnread={hasUnreadNotifications}
          onMarkAllRead={handleMarkAllRead}
          onFilter={handleFilter}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MATCHA_COLOR} />
        </View>
      </View>
    );
  }

  // Empty state
  if (!notifications || notifications.length === 0) {
    return (
      <View style={styles.container}>
        <Header
          hasUnread={hasUnreadNotifications}
          onMarkAllRead={handleMarkAllRead}
          onFilter={handleFilter}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
        />
        <Modal
          visible={showFilterModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <View style={styles.filterModal}>
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowFilterModal(false)}
            />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filter Notifications</Text>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    activeFilter === option.id && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setActiveFilter(option.id);
                    setShowFilterModal(false);
                    if (page !== 1) {
                      setPage(1);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      activeFilter === option.id &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
        <EmptyNotifications refreshing={isFetching} onRefresh={handleRefresh} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        hasUnread={hasUnreadNotifications}
        onMarkAllRead={handleMarkAllRead}
        onFilter={handleFilter}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
      />
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.filterModal}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowFilterModal(false)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Notifications</Text>
            {[
              { id: 'all', label: 'All' },
              { id: 'system', label: 'System' },
              { id: 'user', label: 'User' },
            ].map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.filterOption,
                  activeFilter === option.id && styles.filterOptionActive,
                ]}
                onPress={() => {
                  setActiveFilter(option.id as typeof activeFilter);
                  setShowFilterModal(false);
                  if (page !== 1) {
                    setPage(1);
                  }
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    activeFilter === option.id && styles.filterOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
      <FlashList
        estimatedItemSize={80}
        contentContainerStyle={styles.listContainer}
        data={notifications}
        keyExtractor={(item) => `noti_${item.notification_id}`}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item.notification_id)}
            onDelete={() => handleDelete(item.notification_id)}
          />
        )}
        ItemSeparatorComponent={ItemSeparator}
        ListFooterComponent={
          isFetching ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={MATCHA_COLOR} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching && page === 1}
            onRefresh={handleRefresh}
            tintColor={MATCHA_COLOR}
            colors={[MATCHA_COLOR]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default NotificationsScreen;
