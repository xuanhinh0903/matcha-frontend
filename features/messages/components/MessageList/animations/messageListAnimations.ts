import { Dimensions } from 'react-native';
import { PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3; // Threshold to trigger close action

// Creates the gesture handler logic for swipe-to-close
export const createGestureHandler = (
  translateX: Animated.SharedValue<number>,
  overlayOpacity: Animated.SharedValue<number>,
  onClose: () => void
) => {
  return (event: PanGestureHandlerGestureEvent) => {
    'worklet';
    // Only handle horizontal swipes to the right
    if (event.nativeEvent.translationX > 0) {
      translateX.value = event.nativeEvent.translationX;
      overlayOpacity.value = interpolate(
        event.nativeEvent.translationX,
        [0, SWIPE_THRESHOLD],
        [1, 0], // Fade out overlay as user swipes
        Extrapolate.CLAMP
      );
    }

    // Handle end of gesture
    if (event.nativeEvent.state === 5) {
      // State.END
      if (event.nativeEvent.translationX > SWIPE_THRESHOLD) {
        // Trigger close action if threshold is met
        translateX.value = withSpring(width);
        overlayOpacity.value = withSpring(0);
        onClose();
      } else {
        // Snap back if threshold not met
        translateX.value = withSpring(0);
        overlayOpacity.value = withSpring(1);
      }
    }
  };
};

// Creates the animated styles for the modal components
export const createAnimationStyles = (
  translateX: Animated.SharedValue<number>,
  overlayOpacity: Animated.SharedValue<number>
) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

  return { animatedStyle, overlayStyle };
};
