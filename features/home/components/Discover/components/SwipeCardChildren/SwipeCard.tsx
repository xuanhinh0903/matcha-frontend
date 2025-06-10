import React, { useRef, useState } from 'react';
import { Text, StyleSheet, Animated, PanResponder, Image } from 'react-native';
import { IDiscoverUser } from '@/types/discover.type';

const styles = StyleSheet.create({
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
    left: 40,
    zIndex: 1000,
    fontSize: 32,
    color: 'red',
    fontWeight: '800',
    padding: 10,
    borderWidth: 3,
    borderColor: 'red',
    borderRadius: 10,
  },
  liked: {
    position: 'absolute',
    top: 50,
    right: 40,
    zIndex: 1000,
    fontSize: 32,
    color: 'green',
    fontWeight: '800',
    padding: 10,
    borderWidth: 3,
    borderColor: 'green',
    borderRadius: 10,
  },
});

interface SwipeCardProps {
  user: IDiscoverUser;
  onSwipeLeft: (user: IDiscoverUser) => void;
  onSwipeRight: (user: IDiscoverUser) => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ user, onSwipeLeft, onSwipeRight }) =>  {const position = useRef(new Animated.ValueXY()).current;
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
      if (gesture.dx > 50) {
        setSwipeDirection('right');
      } else if (gesture.dx < -50) {
        setSwipeDirection('left');
      } else {
        setSwipeDirection(null);
      }
    },
    onPanResponderRelease: (event, gesture) => {
      if (gesture.dx > 120) {
        Animated.spring(position, {
          toValue: { x: 500, y: gesture.dy },
          useNativeDriver: true,
        }).start(() => {
          onSwipeRight(user);
          position.setValue({ x: 0, y: 0 });
        });
      } else if (gesture.dx < -120) {
        Animated.spring(position, {
          toValue: { x: -500, y: gesture.dy },
          useNativeDriver: true,
        }).start(() => {
          onSwipeLeft(user);
          position.setValue({ x: 0, y: 0 });
        });
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();
      }
    },
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.card, { transform: position.getTranslateTransform() }]}
    >
      {swipeDirection === 'left' && (
        <Text style={styles.nope}>NOPE</Text>
      )}
      {swipeDirection === 'right' && (
        <Text style={styles.liked}>LIKED</Text>
      )}
      <Image source={{ uri: user.photos[0].url}} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
      <Text style={styles.text}>{user.name}</Text>
    </Animated.View>
  );
};