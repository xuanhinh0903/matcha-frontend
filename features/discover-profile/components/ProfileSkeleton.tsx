import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface ProfileSkeletonProps {
  type?: 'basic' | 'photos' | 'interests' | 'full';
}

const ProfileSkeleton: React.FC<ProfileSkeletonProps> = ({ type = 'full' }) => {
  // Animation for the shimmer effect
  const shimmerValue = useSharedValue(-width);

  // Start the shimmer animation
  React.useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(width, {
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

  const renderBasicSkeleton = () => (
    <>
      {/* Main photo skeleton with gradient overlay */}
      <View style={styles.mainPhotoSkeleton}>
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.photoGradient}
        />

        {/* User Info Skeleton */}
        <View style={styles.userInfoSkeleton}>
          <View style={styles.nameSkeleton}>
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
          </View>
          <View style={styles.locationSkeleton}>
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
          </View>
          <View style={[styles.locationSkeleton, { width: '30%' }]}>
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
          </View>
        </View>
      </View>

      {/* Bio Skeleton */}
      <View style={styles.contentContainer}>
        <View style={styles.bioContainer}>
          <View style={styles.sectionTitleSkeleton}>
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
          </View>
          <View style={styles.bioTextSkeleton}>
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
          </View>
          <View style={[styles.bioTextSkeleton, { width: '70%' }]}>
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
          </View>
        </View>
      </View>
    </>
  );

  const renderPhotosSkeleton = () => (
    <View style={styles.contentContainer}>
      <View style={styles.photosSectionContainer}>
        <View style={styles.sectionTitleSkeleton}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={styles.photosGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={`photo-skeleton-${i}`} style={styles.photoItemSkeleton}>
              <Animated.View style={[styles.shimmer, shimmerStyle]} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderInterestsSkeleton = () => (
    <View style={styles.contentContainer}>
      <View style={styles.interestsContainer}>
        <View style={styles.sectionTitleSkeleton}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={styles.interestsGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <View
              key={`interest-skeleton-${i}`}
              style={styles.interestItemSkeleton}
            >
              <Animated.View style={[styles.shimmer, shimmerStyle]} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} bounces={false}>
      {(type === 'basic' || type === 'full') && renderBasicSkeleton()}
      {(type === 'photos' || type === 'full') && renderPhotosSkeleton()}
      {(type === 'interests' || type === 'full') && renderInterestsSkeleton()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainPhotoSkeleton: {
    height: height * 0.6,
    width: width,
    backgroundColor: '#ECEFF1',
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    width: '40%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    position: 'absolute',
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  userInfoSkeleton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  nameSkeleton: {
    height: 36,
    width: '60%',
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    marginBottom: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  locationSkeleton: {
    height: 20,
    width: '50%',
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    marginBottom: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },
  contentContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  bioContainer: {
    marginBottom: 24,
  },
  sectionTitleSkeleton: {
    height: 22,
    width: '30%',
    backgroundColor: '#ECEFF1',
    marginBottom: 12,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bioTextSkeleton: {
    height: 16,
    width: '100%',
    backgroundColor: '#ECEFF1',
    marginBottom: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  photosSectionContainer: {
    marginBottom: 24,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoItemSkeleton: {
    width: (width - 48) / 3,
    height: (width - 48) / 3,
    backgroundColor: '#ECEFF1',
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  interestsContainer: {
    marginBottom: 24,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestItemSkeleton: {
    height: 36,
    width: 100,
    backgroundColor: '#ECEFF1',
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 18,
    overflow: 'hidden',
  },
});

export default ProfileSkeleton;
