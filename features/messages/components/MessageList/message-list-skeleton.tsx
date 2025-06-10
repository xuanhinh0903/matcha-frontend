import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { colors } from '../../styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MessageListSkeleton = () => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const renderMessageBubbles = () => {
    const bubbles = [];
    for (let i = 0; i < 6; i++) {
      const isRight = i % 2 === 0;
      bubbles.push(
        <View
          key={i}
          style={[
            styles.messageBubble,
            isRight ? styles.rightBubble : styles.leftBubble,
            { width: Math.random() * 100 + 100 }, // Random widths between 100-200
          ]}
        />
      );
    }
    return bubbles;
  };

  return (
    <View style={styles.container}>
      {/* Header skeleton */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Animated.View style={[styles.backButton, animatedStyle]} />
          <Animated.View style={[styles.avatar, animatedStyle]} />
          <View style={styles.headerInfo}>
            <Animated.View style={[styles.nameSkeleton, animatedStyle]} />
            <Animated.View style={[styles.statusSkeleton, animatedStyle]} />
          </View>
        </View>
        <View style={styles.headerRight}>
          <Animated.View style={[styles.iconSkeleton, animatedStyle]} />
          <Animated.View style={[styles.iconSkeleton, animatedStyle]} />
        </View>
      </View>

      {/* Messages skeleton */}
      <View style={styles.messageContainer}>
        <Animated.View style={animatedStyle}>
          {renderMessageBubbles()}
        </Animated.View>
      </View>

      {/* Input skeleton */}
      <View style={styles.inputContainer}>
        <Animated.View style={[styles.inputSkeleton, animatedStyle]} />
        <Animated.View style={[styles.sendButtonSkeleton, animatedStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: colors.border,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  nameSkeleton: {
    width: 120,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.border,
    marginBottom: 4,
  },
  statusSkeleton: {
    width: 60,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  iconSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  messageContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    height: 36,
    borderRadius: 16,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  leftBubble: {
    alignSelf: 'flex-start',
  },
  rightBubble: {
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  inputSkeleton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    marginRight: 8,
  },
  sendButtonSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
  },
});

export default MessageListSkeleton;
