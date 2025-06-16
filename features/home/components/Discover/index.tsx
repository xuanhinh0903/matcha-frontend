import { useDislikeUserMutation, useLikeUserMutation } from '@/rtk-query';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import DiscoverProfileModal from '@/features/discover-profile/components/DiscoverProfileModal';
import { IDiscoverUser } from '@/types/discover.type';
import React from 'react';
import { DiscoverCardContainer } from './components/DiscoverCardContainer';
import { FilterSection } from './components/FilterSection';
// Components
import { UserActions } from './components/UserActions';

// Hooks
import { LikeUserResponse } from '@/rtk-query/likes';
import { useFilterState } from './hooks/useFilterState';
import { useProfileModal } from './hooks/useProfileModal';
import { useRefreshData } from './hooks/useRefreshData';
import { useSwipeActions } from './hooks/useSwipeActions';
import { useMatchPopup } from '@/features/match/hooks/useMatchPopup';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Dimensions.get('window').height * 0.7, // Minimum height to ensure card is visible
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
});

export interface IDiscover {
  peopleToDiscover: IDiscoverUser[];
  refetch: () => void;
  loadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
  userLocation?: {
    latitude?: number;
    longitude?: number;
  };
}

export const Discover = React.memo(
  ({
    peopleToDiscover,
    refetch,
    loadMore,
    isLoading,
    hasMore,
    userLocation,
  }: IDiscover) => {
    // Hook for handling profile modal
    const {
      profileModalVisible,
      selectedUserId,
      handleOpenProfile,
      handleCloseProfile,
    } = useProfileModal();

    // Use the global match popup hook
    const { showMatch } = useMatchPopup();

    const [likeUser, { isLoading: isLiking }] = useLikeUserMutation();
    const [dislikeUser, { isLoading: isDisliking }] = useDislikeUserMutation();

    const handleLikeUser = async (userId: string) => {
      try {
        if (isLiking || userId === '') return;
        const response = await likeUser(userId).unwrap();

        // Check for match using both isMatch flag and status
        const isActualMatch =
          response &&
          (response.isMatch === true || response.status === 'accepted');

        // If it's a match, show the match popup
        if (isActualMatch) {
          console.log('Match detected in handleLikeUser, showing popup');
          showMatch(response);
        }

        return response;
      } catch (error) {
        console.error('Error liking user:', error);
      }
    };

    const handleDislikeUser = async (userId: string) => {
      try {
        if (isDisliking || userId === '') return;
        await dislikeUser(userId).unwrap();
      } catch (error) {
        console.error('Error disliking user:', error);
      }
    };

    const { swipeCardRef, handleSwipeUserMatching, handleLike, handleReject } =
      useSwipeActions({
        handleLikeUser,
        handleDislikeUser,
        loadMore,
        hasMore,
      });

    // Hook for handling refresh and data
    const { users, setUsers, refreshing, onRefresh } = useRefreshData({
      peopleToDiscover,
      refetch,
    });

    // Hook for handling filter state
    const {
      showFilter,
      isFiltering,
      isFilterLoading,
      activeFilters,
      toggleFilterModal,
      handleApplyFilters,
    } = useFilterState({
      refetch,
      userLocation,
      setUsers,
    });

    const handleLikeWithMatch = (matchData?: LikeUserResponse) => {
      console.log('Match data in handleLikeWithMatch:', matchData);

      const isActualMatch =
        matchData &&
        (matchData.isMatch === true || matchData.status === 'accepted');

      if (isActualMatch && matchData) {
        console.log('Match detected, showing global popup');
        showMatch(matchData);
      }

      handleLike();
    };

    // Handle actions from the profile modal (like/dislike)
    const handleProfileAction = (
      userId: string,
      action: 'like' | 'dislike'
    ) => {
      // Find the index of the user card to remove
      const userIndex = users.findIndex(
        (user) => String(user.user_id) === userId
      );

      if (userIndex >= 0) {
        // Create a new array without the liked/disliked user
        const updatedUsers = [...users];
        updatedUsers.splice(userIndex, 1);
        setUsers(updatedUsers);

        // Also perform the API call in the background if needed
        if (action === 'like') {
          handleLikeUser(userId);
        } else if (action === 'dislike') {
          handleDislikeUser(userId);
        }
      }
    };

    // Determine if we should show loading state
    const showLoading = isLoading || isFiltering || isFilterLoading;

    return (
      <View style={styles.container}>
        {/* Filter Section - Now with isLoading prop */}
        <FilterSection
          showFilter={showFilter}
          toggleFilterModal={toggleFilterModal}
          onApplyFilters={handleApplyFilters}
          initialFilters={activeFilters}
          isLoading={showLoading}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.cardContainer}>
            {/* Card Container */}
            <DiscoverCardContainer
              users={users}
              setUsers={setUsers}
              showLoading={showLoading}
              swipeCardRef={swipeCardRef}
              handleSwipeUserMatching={handleSwipeUserMatching}
              onProfilePress={handleOpenProfile}
            />
          </View>
        </ScrollView>

        {/* Action Buttons */}
        {!!users.length && !showLoading && (
          <View style={styles.actionsContainer}>
            <UserActions
              onLike={handleLikeWithMatch}
              onReject={handleReject}
              userId={users[0]?.user_id ? String(users[0].user_id) : ''}
            />
          </View>
        )}

        {/* Profile Modal with onActionComplete callback */}
        <DiscoverProfileModal
          visible={profileModalVisible}
          userId={selectedUserId}
          onClose={handleCloseProfile}
          onActionComplete={handleProfileAction}
        />
      </View>
    );
  }
);
