import {
  Animated,
  PanResponder,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

export interface SwipeCardRef {
  handleChoice: (direction: number) => void;
}

export interface ISwipeCard<T> {
  children: (
    item: T,
    swipe: Animated.ValueXY,
    isFirst: boolean
  ) => React.ReactNode;
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  onSwipeUser?: (swipe: Animated.ValueXY, prevState: T[]) => void;
  swipeThreshold?: number;
  swipeOutDistance?: number;
  keyExtractor?: (item: T, index: number) => string;
  containerStyle?: StyleProp<ViewStyle>;
  cardStyle?: StyleProp<ViewStyle>;
  maxVisibleCards?: number;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 10,
    shadowRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 0 },
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 50,
    color: '#fff',
  },
  nope: {
    position: 'absolute',
    top: 50,
    left: 100,
    fontSize: 40,
    fontWeight: '800',
    color: 'red',
    borderWidth: 4,
    borderColor: 'red',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    textTransform: 'uppercase',
  },
  liked: {
    position: 'absolute',
    top: 50,
    right: 100,
    fontSize: 40,
    fontWeight: '800',
    color: 'green',
    borderWidth: 4,
    borderColor: 'green',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    textTransform: 'uppercase',
  },
});

export const SwipeCard = forwardRef(
  <T,>(props: ISwipeCard<T>, ref: React.ForwardedRef<SwipeCardRef>) => {
    const {
      children,
      items,
      setItems,
      onSwipeUser,
      swipeThreshold = 120,
      swipeOutDistance = 600,
      keyExtractor,
      containerStyle,
      cardStyle,
      maxVisibleCards = 3,
    } = props;

    // Use useState for transitioning to ensure re-renders when it changes
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

    // Animation values
    const swipe = useRef(new Animated.ValueXY()).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const swipeDirectionRef = useRef<'left' | 'right' | null>(null);

    // Clear timeout reference
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Reset all animation values and state when items change or component mounts
    useEffect(() => {
      const cleanupAndReset = () => {
        // Clear any existing timeouts
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // Reset animation values
        swipe.setValue({ x: 0, y: 0 });
        opacity.setValue(1);

        // Reset transition state
        if (isTransitioning) {
          setIsTransitioning(false);
        }

        swipeDirectionRef.current = null;
      };

      // Reset immediately when items change
      cleanupAndReset();

      // Cleanup on unmount
      return cleanupAndReset;
    }, [items]);

    // Rotation for the curved swipe path
    const rotate = swipe.x.interpolate({
      inputRange: [-300, 0, 300],
      outputRange: ['25deg', '0deg', '-25deg'],
      extrapolate: 'clamp',
    });

    // Y-coordinate for curved path
    const curveY = swipe.x.interpolate({
      inputRange: [-300, -150, 0, 150, 300],
      outputRange: [40, 20, 0, 20, 40], // Curve upward slightly
      extrapolate: 'clamp',
    });

    // Function to safely reset card state
    const resetCardState = useCallback(() => {
      // Reset animation values
      swipe.setValue({ x: 0, y: 0 });
      opacity.setValue(1);

      // Delay the transition state reset slightly to avoid rapid swipes
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        timeoutRef.current = null;
      }, 100);
    }, [swipe, opacity]);

    // Function to remove the top card
    const removeTopCard = useCallback(() => {
      // Don't proceed if already transitioning
      if (isTransitioning) return;

      // Set transitioning state
      setIsTransitioning(true);

      // Update the items state to remove the top card
      setItems((prevState) => {
        if (prevState.length <= 1) return prevState;

        onSwipeUser?.(swipe, prevState);
        return prevState.slice(1);
      });

      // Reset the card state to prepare for the next card
      requestAnimationFrame(() => {
        if (Platform.OS === 'ios') {
          // iOS sometimes needs a small delay
          setTimeout(resetCardState, 10);
        } else {
          resetCardState();
        }
      });
    }, [setItems, onSwipeUser, swipe, isTransitioning, resetCardState]);

    // Create the pan responder for touch gestures
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => false, // Don't capture taps
      onMoveShouldSetPanResponder: (_, { dx, dy }) => {
        // Only respond to horizontal swipes if not transitioning
        return (
          !isTransitioning && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 5
        );
      },
      onPanResponderGrant: () => {
        // Make sure transitioning is false when starting a gesture
        if (isTransitioning) {
          setIsTransitioning(false);
        }
      },
      onPanResponderMove: (_, { dx, dy }) => {
        if (isTransitioning) return;

        // Apply curve to y based on x movement
        const calculatedY = Math.abs(dx) * 0.05;
        swipe.setValue({
          x: dx,
          y: calculatedY,
        });

        // Update swipe direction based on drag distance
        if (dx > 50) {
          swipeDirectionRef.current = 'right';
        } else if (dx < -50) {
          swipeDirectionRef.current = 'left';
        } else {
          swipeDirectionRef.current = null;
        }
      },
      onPanResponderRelease: (_, { dx }) => {
        if (isTransitioning) return;

        const direction = Math.sign(dx);
        const isSwipedOffScreen = Math.abs(dx) > swipeThreshold;

        if (isSwipedOffScreen) {
          setIsTransitioning(true);

          // Run exit animation
          Animated.parallel([
            Animated.timing(swipe, {
              toValue: {
                x: direction * swipeOutDistance,
                y: Math.abs(direction * swipeOutDistance) * 0.05,
              },
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
          ]).start(({ finished }) => {
            if (finished) {
              removeTopCard();
            } else {
              resetCardState();
            }
          });
        } else {
          // Spring back to center
          Animated.spring(swipe, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            friction: 12,
            tension: 50,
            restSpeedThreshold: 5,
            restDisplacementThreshold: 5,
          }).start(() => {
            swipeDirectionRef.current = null;
          });
        }
      },
      onPanResponderTerminate: () => {
        // Reset if pan responder is terminated unexpectedly
        Animated.spring(swipe, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();

        resetCardState();
      },
    });

    // Handle card styling based on index
    const animatedCardStyle = (index: number) => {
      // Only style visible cards
      if (index >= maxVisibleCards) {
        return { opacity: 0 };
      }

      if (index === 0) {
        // Current card - apply swipe animations
        return {
          transform: [
            { translateX: swipe.x },
            { translateY: curveY },
            { rotate },
          ],
          opacity: opacity,
          zIndex: 3,
        };
      } else if (index === 1) {
        // Next card - subtle animations to respond to top card movement
        return {
          transform: [
            {
              scale: swipe.x.interpolate({
                inputRange: [-swipeThreshold, 0, swipeThreshold],
                outputRange: [0.98, 0.95, 0.98],
                extrapolate: 'clamp',
              }),
            },
            {
              translateY: swipe.x.interpolate({
                inputRange: [-swipeThreshold, 0, swipeThreshold],
                outputRange: [0, 5, 0],
                extrapolate: 'clamp',
              }),
            },
          ],
          opacity: 1,
          zIndex: 2,
        };
      }

      // Background cards - static styling
      return {
        transform: [
          { scale: 0.9 - (index - 1) * 0.02 },
          { translateY: 10 * (index - 1) },
        ],
        opacity: 0.8 - (index - 1) * 0.1,
        zIndex: 1,
      };
    };

    // Handle programmatic swipe choice
    const handleChoice = useCallback(
      (direction: number) => {
        if (isTransitioning) return;

        setIsTransitioning(true);

        // Animate swipe and fade out
        Animated.parallel([
          Animated.timing(swipe.x, {
            toValue: direction * swipeOutDistance,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(swipe.y, {
            toValue: Math.abs(direction * swipeOutDistance) * 0.05,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) {
            removeTopCard();
          } else {
            resetCardState();
          }
        });
      },
      [
        isTransitioning,
        swipe.x,
        swipe.y,
        opacity,
        swipeOutDistance,
        removeTopCard,
        resetCardState,
      ]
    );

    // Expose handleChoice for external control
    useImperativeHandle(ref, () => ({
      handleChoice,
    }));

    // Label effects
    const nopeOpacity = swipe.x.interpolate({
      inputRange: [-swipeThreshold, -swipeThreshold / 2],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const likedOpacity = swipe.x.interpolate({
      inputRange: [swipeThreshold / 2, swipeThreshold],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    const nopeTransform = {
      transform: [
        { rotate: '-15deg' },
        {
          translateX: swipe.x.interpolate({
            inputRange: [-swipeThreshold, 0],
            outputRange: [-30, 0],
            extrapolate: 'clamp',
          }),
        },
      ],
    };

    const likedTransform = {
      transform: [
        { rotate: '15deg' },
        {
          translateX: swipe.x.interpolate({
            inputRange: [0, swipeThreshold],
            outputRange: [30, 0],
            extrapolate: 'clamp',
          }),
        },
      ],
    };

    // Only render the visible cards for performance
    const visibleItems = items.slice(0, maxVisibleCards);

    return (
      <View style={{ position: 'relative', width: '100%', height: '100%' }}>
        <View style={[styles.container, containerStyle]}>
          {visibleItems.map((item, index) => {
            const key = keyExtractor
              ? keyExtractor(item, index)
              : `card-${index}`;

            const cardStyles = animatedCardStyle(index);

            return (
              <Animated.View
                key={key}
                style={[
                  styles.card,
                  cardStyle,
                  { zIndex: maxVisibleCards - index },
                  cardStyles,
                ]}
                // Only attach pan handler to the top card
                {...(index === 0 ? panResponder.panHandlers : {})}
              >
                {children(item, swipe, index === 0)}
                {index === 0 && (
                  <>
                    <Animated.Text
                      style={[
                        styles.nope,
                        nopeTransform,
                        { opacity: nopeOpacity },
                      ]}
                    >
                      NOPE
                    </Animated.Text>
                    <Animated.Text
                      style={[
                        styles.liked,
                        likedTransform,
                        { opacity: likedOpacity },
                      ]}
                    >
                      LIKED
                    </Animated.Text>
                  </>
                )}
              </Animated.View>
            );
          })}
        </View>
      </View>
    );
  }
) as <T>(
  props: ISwipeCard<T> & { ref?: React.ForwardedRef<SwipeCardRef> }
) => React.ReactElement;
