import React, { FC, useRef } from 'react';
import { TouchableOpacity, View, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserActionsStyleSheet } from './styles';
import { useLikeUserMutation, useDislikeUserMutation } from '@/rtk-query';
import { LikeUserResponse } from '@/rtk-query/likes';

export interface IUserActions {
  onReject: () => void;
  onLike: (matchData?: LikeUserResponse) => void;
  userId: string;
}

export const UserActions: FC<IUserActions> = ({ onReject, onLike, userId }) => {
  const [likeUser, { isLoading: isLiking }] = useLikeUserMutation();
  const [dislikeUser, { isLoading: isDisliking }] = useDislikeUserMutation();

  // Animation values for button press effect
  const rejectScale = useRef(new Animated.Value(1)).current;
  const likeScale = useRef(new Animated.Value(1)).current;

  const animatePress = (animatedValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(animatedValue, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLike = async () => {
    try {
      if (isLiking || userId === '') return;

      // First animate button press
      animatePress(likeScale);

      // IMPORTANT: Call onLike IMMEDIATELY with no data, for UI responsiveness
      onLike();

      // Then make API call in the background
      const response = await likeUser(userId).unwrap();
      console.log('🚀 ~ handleLike ~ response:', response);

      // If we have match data from the API, we can send another onLike with the data
      // This won't affect UI but can be used for match popup logic elsewhere
      if (response && (response.isMatch || response.status === 'accepted')) {
        onLike(response);
      }
    } catch (error) {
      console.error('Error liking user:', error);
    }
  };

  const handleNope = async () => {
    try {
      if (isDisliking || userId === '') return;

      // First animate button press
      animatePress(rejectScale);

      // IMPORTANT: Call onReject IMMEDIATELY for UI responsiveness
      onReject();

      // Then make API call in the background
      await dislikeUser(userId).unwrap();
    } catch (error) {
      console.error('Error nopeing user:', error);
    }
  };

  return (
    <View style={UserActionsStyleSheet.wrapper} className="user-actions">
      {/* Reject Button */}
      <Animated.View style={{ transform: [{ scale: rejectScale }] }}>
        <TouchableOpacity
          onPress={handleNope}
          activeOpacity={0.7}
          style={[
            UserActionsStyleSheet.iconWrapper,
            UserActionsStyleSheet.closeWrapper,
          ]}
        >
          <Icon name="close-thick" size={36} color="#FF5A87" />
        </TouchableOpacity>
      </Animated.View>

      {/* Like Button */}
      <Animated.View style={{ transform: [{ scale: likeScale }] }}>
        <TouchableOpacity
          onPress={handleLike}
          activeOpacity={0.7}
          style={[
            UserActionsStyleSheet.iconWrapper,
            UserActionsStyleSheet.heartWrapper,
          ]}
        >
          <Icon name="heart" size={36} color="#4ADE80" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};
