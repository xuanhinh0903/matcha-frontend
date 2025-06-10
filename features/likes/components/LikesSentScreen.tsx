import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useGetLikesSentQuery } from '@/rtk-query';
import { LikeUserCard } from './LikeUserCard';
import { IDiscoverUser } from '@/types/discover.type';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DiscoverProfileModal from '@/features/discover-profile/components/DiscoverProfileModal';

export const LikesSentScreen: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, refetch } = useGetLikesSentQuery({
    page,
    limit: 10,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleUserPress = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setProfileModalVisible(true);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setProfileModalVisible(false);
    // Refresh data when profile modal closes to update the list if a user was unliked
    refetch();
  }, [refetch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
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
        <MaterialCommunityIcons
          name="heart-outline"
          size={80}
          color="#E0E0E0"
        />
        <Text style={styles.emptyText}>You haven't liked anyone yet</Text>
        <Text style={styles.emptySubText}>
          When you like someone, they'll appear here
        </Text>
      </View>
    );
  }, [isLoading]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={data?.users || []}
          keyExtractor={(item, index) => `like-${item.user_id}-${index}`}
          renderItem={({ item }) => (
            <LikeUserCard
              user={item as unknown as IDiscoverUser}
              onPress={handleUserPress}
              showLikedAt
              whoLikedYou={false}
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
        isFromLikesSent={true}
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
