import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface MatchPopupProps {
  visible: boolean;
  user1Image: string;
  user2Image: string;
  user2Name: string;
  conversationId?: string;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

// Get screen dimensions for full-screen design
const { width, height } = Dimensions.get('window');

// Create a sparkle component for celebration effect instead of using Lottie
interface SparkleProps {
  delay: number;
  duration: number;
  size: number;
  top: number;
  left: number;
  color: string;
}

const Sparkle: React.FC<SparkleProps> = ({
  delay,
  duration,
  size,
  top,
  left,
  color,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration * 0.3,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: duration * 0.5,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -50,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(duration * 0.7),
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration * 0.3,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        opacity,
        transform: [{ scale }, { translateY }],
      }}
    >
      <View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: color,
          borderRadius: size / 2,
        }}
      />
    </Animated.View>
  );
};

export const MatchPopup: React.FC<MatchPopupProps> = ({
  visible,
  user1Image,
  user2Image,
  user2Name,
  conversationId,
  onSendMessage,
  onKeepSwiping,
}) => {
  const router = useRouter();

  // Animation values for pulsating avatars
  const scaleAnim1 = useRef(new Animated.Value(0.8)).current;
  const scaleAnim2 = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  // Animation refs to store running animations
  const anim1Ref = useRef<Animated.CompositeAnimation | null>(null);
  const anim2Ref = useRef<Animated.CompositeAnimation | null>(null);

  // State to control sparkle creation
  const [sparkles, setSparkles] = useState<
    Array<{ id: number; props: SparkleProps }>
  >([]);

  // Create sparkles function
  const createSparkles = () => {
    if (!visible) return;

    const newSparkles = [];
    const colors = ['#FFFFFF', '#FFEB3B', '#4ADE80', '#FFC107', '#FF9800'];

    for (let i = 0; i < 20; i++) {
      newSparkles.push({
        id: Date.now() + i,
        props: {
          delay: Math.random() * 2000,
          duration: 2000 + Math.random() * 3000,
          size: 5 + Math.random() * 15,
          top: Math.random() * height * 0.8,
          left: Math.random() * width * 0.9,
          color: colors[Math.floor(Math.random() * colors.length)],
        },
      });
    }

    setSparkles(newSparkles);
  };

  useEffect(() => {
    if (visible) {
      // Reset animations when modal becomes visible
      opacityAnim.setValue(0);
      slideUpAnim.setValue(50);
      scaleAnim1.setValue(0.8);
      scaleAnim2.setValue(0.8);

      // Clear any running animations
      if (anim1Ref.current) {
        anim1Ref.current.stop();
      }
      if (anim2Ref.current) {
        anim2Ref.current.stop();
      }

      // Fade in and slide up animations
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulsating animation for first avatar
      anim1Ref.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim1, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim1, {
            toValue: 0.95,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      anim1Ref.current.start();

      // Pulsating animation for second avatar with offset
      anim2Ref.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim2, {
            toValue: 0.95,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim2, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      anim2Ref.current.start();

      // Create initial sparkles
      createSparkles();

      // Create new sparkles every 3 seconds
      const sparkleInterval = setInterval(createSparkles, 3000);

      return () => {
        if (anim1Ref.current) {
          anim1Ref.current.stop();
        }
        if (anim2Ref.current) {
          anim2Ref.current.stop();
        }
        clearInterval(sparkleInterval);
      };
    }
  }, [visible]);

  // Handle message button press with direct navigation if conversationId exists
  const handleSendMessage = () => {
    if (conversationId) {
      onSendMessage();
      // Navigate directly to the message detail screen with the conversation ID
      router.replace({
        pathname: '/(message-detail)',
        params: { conversation_id: conversationId },
      });
    } else {
      // Fall back to the original onSendMessage handler
      onSendMessage();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <LinearGradient
        colors={['#86A789', '#4ADE80', '#F9F871']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Sparkles effect instead of Lottie confetti */}
        {sparkles.map((sparkle) => (
          <Sparkle key={sparkle.id} {...sparkle.props} />
        ))}

        <Animated.View
          style={[
            styles.content,
            {
              opacity: opacityAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <Text style={styles.title}>IT'S A MATCH!</Text>

          <Text style={styles.subtitle}>
            Congratulations! You and {user2Name} have liked each other!
          </Text>

          <View style={styles.imagesContainer}>
            <Animated.View
              style={[
                styles.avatarWrapper,
                { transform: [{ scale: scaleAnim1 }] },
              ]}
            >
              <Image
                source={{ uri: user1Image || 'https://picsum.photos/200' }}
                style={styles.avatar}
              />
            </Animated.View>

            <View style={styles.heartContainer}>
              <Image
                source={require('@/assets/HeartIcon.png')}
                style={styles.heartIcon}
              />
            </View>

            <Animated.View
              style={[
                styles.avatarWrapper,
                { transform: [{ scale: scaleAnim2 }] },
              ]}
            >
              <Image
                source={{ uri: user2Image || 'https://picsum.photos/200' }}
                style={styles.avatar}
              />
            </Animated.View>
          </View>

          <Text style={styles.congratsText}>
            Time to start a conversation and get to know each other better!
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSendMessage}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4ADE80', '#86A789']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>Send a Message</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onKeepSwiping}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Keep Swiping</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  imagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  avatarWrapper: {
    borderRadius: 100,
    padding: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  heartContainer: {
    marginHorizontal: 15,
  },
  heartIcon: {
    width: 60,
    height: 60,
    tintColor: '#FFFFFF',
  },
  congratsText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
    paddingHorizontal: 30,
  },
  primaryButton: {
    width: '80%',
    marginBottom: 16,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    marginBottom: 20,
    padding: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});
