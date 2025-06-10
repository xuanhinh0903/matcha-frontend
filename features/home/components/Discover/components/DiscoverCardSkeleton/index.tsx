import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Dimensions, StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';

import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 16,
    height: SCREEN_HEIGHT * 0.65,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    width: '40%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    position: 'absolute',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    zIndex: 1,
    width: '100%',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 2,
  },
  nameAgeSkeleton: {
    height: 30,
    width: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 12,
    borderRadius: 4,
  },
  locationSkeleton: {
    height: 22,
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
});

const DiscoverCardSkeleton: React.FC = () => {
  // Animation for the shimmer effect
  const shimmerValue = useSharedValue(-SCREEN_WIDTH);

  // Start the shimmer animation
  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(SCREEN_WIDTH, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
  }, [shimmerValue]);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerValue.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.shimmer, shimmerStyle]} />

      {/* Add gradient overlay similar to the actual card */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.85)']}
        style={styles.gradientOverlay}
      />

      {/* Skeleton elements for user info */}
      <View style={styles.infoContainer}>
        <View style={styles.nameAgeSkeleton}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={styles.locationSkeleton}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
      </View>
    </View>
  );
};

export default DiscoverCardSkeleton;
