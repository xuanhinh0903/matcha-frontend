import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { colors } from '../../styles';

// Matcha theme colors
const matchaColors = {
  primary: colors.primary,
  secondary: '#86A789',
  light: '#D2E3C8',
  extraLight: '#EBF3E8',
  text: '#2D3F2D',
  textLight: '#5F7161',
  border: '#B2C8B2',
  white: '#FFFFFF',
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Default and expanded heights
const DEFAULT_HEIGHT = SCREEN_HEIGHT * 0.65; // 65% of screen height
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.9; // 90% of screen height
const HEADER_HEIGHT = 25; // Height of the pull indicator

interface ExpandableTabContentProps {
  children: React.ReactNode;
  tabBarHeight: number; // Height of the tab navigation bar
}

export const ExpandableTabContent: React.FC<ExpandableTabContentProps> = ({
  children,
  tabBarHeight,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(DEFAULT_HEIGHT)).current;

  // Reset animation when component is re-rendered with new children
  useEffect(() => {
    setIsExpanded(false);
    Animated.spring(animatedHeight, {
      toValue: DEFAULT_HEIGHT,
      useNativeDriver: false,
      friction: 10,
    }).start();
  }, [children]);

  const expand = () => {
    setIsExpanded(true);
    Animated.spring(animatedHeight, {
      toValue: EXPANDED_HEIGHT,
      useNativeDriver: false,
      friction: 10,
    }).start();
  };

  const collapse = () => {
    setIsExpanded(false);
    Animated.spring(animatedHeight, {
      toValue: DEFAULT_HEIGHT,
      useNativeDriver: false,
      friction: 10,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dy } = gestureState;
        // Only respond to vertical gestures
        return Math.abs(dy) > 5;
      },
      onPanResponderGrant: () => {
        // When gesture starts, stop any ongoing animation
        animatedHeight.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        const { dy } = gestureState;

        if (isExpanded) {
          // If expanded, allow dragging down to collapse
          const newHeight = Math.max(DEFAULT_HEIGHT, EXPANDED_HEIGHT - dy);
          animatedHeight.setValue(newHeight);
        } else {
          // If collapsed, allow dragging up to expand
          const newHeight = Math.min(EXPANDED_HEIGHT, DEFAULT_HEIGHT - dy);
          animatedHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dy, vy } = gestureState;

        if (isExpanded) {
          // If expanded and dragged down or flicked down
          if (dy > 50 || vy > 0.5) {
            collapse();
          } else {
            // Return to expanded state
            expand();
          }
        } else {
          // If collapsed and dragged up or flicked up
          if (dy < -50 || vy < -0.5) {
            expand();
          } else {
            // Return to collapsed state
            collapse();
          }
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: animatedHeight,
          top: tabBarHeight, // Position right below the tab bar
        },
      ]}
    >
      {/* Draggable handle at the top of the content */}
      <View {...panResponder.panHandlers} style={styles.dragHandle}>
        <View style={styles.dragIndicator} />
      </View>

      {/* Content container */}
      <View style={styles.contentContainer}>{children}</View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: matchaColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    overflow: 'hidden',
    zIndex: 100,
  },
  dragHandle: {
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: matchaColors.border,
    borderRadius: 3,
  },
  contentContainer: {
    flex: 1,
  },
});
