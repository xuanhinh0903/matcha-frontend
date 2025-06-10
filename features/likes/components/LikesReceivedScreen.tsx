import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';

import DiscoverProfileModal from '@/features/discover-profile/components/DiscoverProfileModal';
import { IDiscoverUser } from '@/types/discover.type';
import { LikeUserCard } from './LikeUserCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetLikesReceivedQuery } from '@/rtk-query';

export const LikesReceivedScreen: React.FC = () => {
  const [page, setPage] = useState(1);
  const [allUsers, setAllUsers] = useState<IDiscoverUser[]>([]);
  const { data, isLoading, isFetching, refetch } = useGetLikesReceivedQuery({
    page,
    limit: 10,
  });

  // Update accumulated users when new data comes in
  useEffect(() => {
    if (data?.users) {
      if (page === 1) {
        // Reset users list when refreshing (page 1)
        setAllUsers(data.users as unknown as IDiscoverUser[]);
      } else {
        // Append users when loading more pages
        setAllUsers((prev) => [
          ...prev,
          ...(data.users as unknown as IDiscoverUser[]),
        ]);
      }
    }
  }, [data, page]);

  const [refreshing, setRefreshing] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleUserPress = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setProfileModalVisible(true);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setProfileModalVisible(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1); // Reset to first page when refreshing
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (!isFetching && data && data.total > page * 10) {
      setPage((prev) => prev + 1);
    }
  }, [isFetching, data, page]);

  const renderEmptyComponent = useCallback(() => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="heart-off" size={80} color="#E0E0E0" />
        <Text style={styles.emptyText}>You don't have any likes yet</Text>
        <Text style={styles.emptySubText}>
          When someone likes your profile, they'll appear here
        </Text>
      </View>
    );
  }, [isLoading]);

  return (
    <View style={styles.container}>
      {isLoading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={allUsers}
          keyExtractor={(item, index) => `like-${item.user_id}-${index}`}
          renderItem={({ item }) => (
            <LikeUserCard
              user={item}
              onPress={handleUserPress}
              showLikedAt
              whoLikedYou
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#4CAF50']}
              tintColor="#4CAF50"
            />
          }
          ListEmptyComponent={renderEmptyComponent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetching && !refreshing ? (
              <ActivityIndicator
                style={styles.footerLoader}
                color="#4CAF50"
                size="small"
              />
            ) : null
          }
        />
      )}

      <DiscoverProfileModal
        visible={profileModalVisible}
        userId={selectedUserId}
        onClose={handleCloseProfile}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  footerLoader: {
    marginVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
