import { Dimensions } from 'react-native';
import {
  Extrapolate,
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

// Create gesture handler for swipe back
export const createGestureHandler = (
  translateX: any,
  overlayOpacity: any,
  onBack: () => void
) => {
  return useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
    },
    onActive: (event: any, ctx: any) => {
      translateX.value = ctx.startX + Math.max(0, event.translationX);
      overlayOpacity.value = interpolate(
        translateX.value,
        [0, SCREEN_WIDTH],
        [0.3, 0],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event: any) => {
      const shouldClose =
        event.velocityX > 500 || translateX.value > SWIPE_THRESHOLD;

      if (shouldClose) {
        translateX.value = withSpring(SCREEN_WIDTH, { damping: 20 });
        overlayOpacity.value = withSpring(0);
        onBack();
      } else {
        translateX.value = withSpring(0);
        overlayOpacity.value = withSpring(0.3);
      }
    },
  });
};

// Create animation styles
export const createAnimationStyles = (translateX: any, overlayOpacity: any) => {
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    backgroundColor: `rgba(0, 0, 0, ${overlayOpacity.value})`,
  }));

  const backIconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SCREEN_WIDTH * 0.2],
      [0, 1],
      Extrapolate.CLAMP
    );

    const finalOpacity = opacity * (overlayOpacity.value / 0.3);

    return {
      opacity: finalOpacity,
      transform: [{ scale: finalOpacity }],
    };
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return {
    overlayStyle,
    backIconStyle,
    animatedStyle,
  };
};
