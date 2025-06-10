import { useDispatch } from 'react-redux';
import {
  showMatchPopup,
  hideMatchPopup,
  MatchedUser,
} from '@/store/global/match';
import { useGetProfileQuery } from '@/rtk-query';
import { LikeUserResponse } from '@/rtk-query/likes';

export const useMatchPopup = () => {
  const dispatch = useDispatch();
  const { data: currentUserProfile } = useGetProfileQuery();

  const showMatch = (matchData: LikeUserResponse) => {
    if (!matchData) return;

    // Get current user's profile image
    const currentUserImage = currentUserProfile?.profile_thumbnail || '';

    // Prepare matched user data
    const matchedUser: MatchedUser = {
      name: matchData.matchedUser?.full_name || 'Your match',
      image: matchData.matchedUser?.profile_picture || '',
      conversationId: matchData.conversation_id,
    };

    // Show the match popup
    dispatch(
      showMatchPopup({
        currentUserImage,
        matchedUser,
      })
    );

    console.log('Showing global match popup with data:', {
      currentUserImage,
      matchedUser,
    });
  };

  const hideMatch = () => {
    dispatch(hideMatchPopup());
  };

  return {
    showMatch,
    hideMatch,
  };
};
