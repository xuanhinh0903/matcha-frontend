import React from 'react';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { MatchPopup } from '@/features/home/components/MatchPopup';
import { selectMatchState, hideMatchPopup } from '@/store/global/match';

export const GlobalMatchPopup = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // Get match state from Redux
  const { isVisible, currentUserImage, matchedUser } =
    useSelector(selectMatchState);

  const handleSendMessage = () => {
    // Hide the popup
    dispatch(hideMatchPopup());

    // Navigate to messages if we have a conversation ID
    if (matchedUser?.conversationId) {
      setTimeout(() => {
        router.push({
          pathname: '/(tabs)/messages',
          params: { conversation_id: matchedUser.conversationId },
        });
      }, 100);
    }
  };

  const handleKeepSwiping = () => {
    // Hide the popup
    dispatch(hideMatchPopup());
  };

  // Only render the popup if we have a matched user
  if (!matchedUser) return null;

  return (
    <MatchPopup
      visible={isVisible}
      user1Image={currentUserImage}
      user2Image={matchedUser.image}
      user2Name={matchedUser.name}
      conversationId={matchedUser.conversationId}
      onSendMessage={handleSendMessage}
      onKeepSwiping={handleKeepSwiping}
    />
  );
};
