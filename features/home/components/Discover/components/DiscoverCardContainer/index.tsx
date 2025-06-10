import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SwipeCard } from '@/components/ui/SwipeCard/matcha-swipe-card';
import { IDiscoverUser } from '@/types/discover.type';
import { SwipeCardChildren } from '../SwipeCardChildren';
import { UnavailableUsers } from '../UnavailableUsers';
import { Animated } from 'react-native';
import DiscoverCardSkeleton from '../DiscoverCardSkeleton';

// Get screen dimensions
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DiscoverCardContainerProps {
  users: IDiscoverUser[];
  setUsers: React.Dispatch<React.SetStateAction<IDiscoverUser[]>>;
  showLoading: boolean;
  swipeCardRef: React.RefObject<any>;
  handleSwipeUserMatching: (
    swipe: Animated.ValueXY,
    prevState: IDiscoverUser[]
  ) => void;
  onProfilePress: (userId: string) => void;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flex: 1,
    minHeight: SCREEN_HEIGHT * 0.7, // Ensure minimum height
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noUsers: {
    alignItems: 'center',
  },
});

export const DiscoverCardContainer: React.FC<DiscoverCardContainerProps> = ({
  users,
  setUsers,
  showLoading,
  swipeCardRef,
  handleSwipeUserMatching,
  onProfilePress,
}) => {
  if (showLoading) {
    return (
      <View style={styles.loadingContainer}>
        <DiscoverCardSkeleton />
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.noUsers}>
        <UnavailableUsers />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SwipeCard<IDiscoverUser>
        ref={swipeCardRef}
        onSwipeUser={handleSwipeUserMatching}
        items={users}
        setItems={setUsers}
        containerStyle={{ width: '100%', height: '100%' }}
      >
        {(item, swipe, isFirst) => (
          <SwipeCardChildren
            item={item}
            swipe={swipe}
            isFirst={isFirst}
            renderChoice={(swipeValue) => <View style={{ opacity: 0 }} />}
            onProfilePress={onProfilePress}
          />
        )}
      </SwipeCard>
    </View>
  );
};
