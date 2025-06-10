import { useCallback, useRef, useState } from 'react';

import { Animated } from 'react-native';
import { IDiscoverUser } from '@/types/discover.type';
import { SwipeCardRef } from '@/components/ui/SwipeCard/matcha-swipe-card';
import { useRouter } from 'expo-router';
import { LikeUserResponse } from '@/rtk-query/likes';

type SwipeActionsProps = {
  handleLikeUser: (userId: string) => void;
  handleDislikeUser: (userId: string) => void;
  loadMore?: () => void;
  hasMore?: boolean;
};

export const useSwipeActions = ({
  handleLikeUser,
  handleDislikeUser,
  loadMore,
  hasMore,
}: SwipeActionsProps) => {
  const swipeCardRef = useRef<SwipeCardRef>(null);
  const lastUserRef = useRef<IDiscoverUser | null>(null);
  const currentUserRef = useRef<number | null>(null);
  const router = useRouter();

  // Match popup state
  const [matchPopupVisible, setMatchPopupVisible] = useState(false);
  const [matchedUser, setMatchedUser] = useState<{
    name: string;
    image: string;
  }>({ name: '', image: '' });
  const [currentUserImage, setCurrentUserImage] = useState<string>('');

  const handleSwipeUserMatching = useCallback(
    (swipe: Animated.ValueXY, prevState: IDiscoverUser[]) => {
      console.log('🚀 ~ =>>>>>>>>>>>>>>>:', prevState.length);
      if (prevState.length > 0) {
        // For the x-axis: negative value = swipe left (NOPE), positive value = swipe right (LIKE)
        currentUserRef.current = prevState[0].user_id;
        // Store last swiped user for potential match
        lastUserRef.current = prevState[0];

        // Set current user image for match popup
        if (prevState[0]?.current_user_photo) {
          setCurrentUserImage(prevState[0].current_user_photo);
        } else {
          // Fallback to first profile photo if available
          const profilePhoto =
            prevState[0]?.photos?.find((p) => p.is_profile_picture)
              ?.photo_url ||
            prevState[0]?.photos?.[0]?.photo_url ||
            '';
          setCurrentUserImage(profilePhoto);
        }

        // Use type assertion to access the animated value
        const xValue = (swipe.x as any)._value || 0;
        console.log('🚀 ~ xValue:', xValue);

        if (xValue >= 0) {
          handleLikeUser(currentUserRef.current.toString());
          console.log(
            '🚀 ~ currentUserRef.current.toString():',
            currentUserRef.current.toString()
          );
        } else {
          handleDislikeUser(currentUserRef.current.toString());
        }

        // The item has been removed from the list by SwipeCard
        // If this was the last item (prevState.length === 1), the list is now empty
        // and DiscoverCardContainer will automatically show UnavailableUsers

        // If we're getting low on items and more are available, load more
        if (prevState.length <= 2 && loadMore && hasMore) {
          loadMore();
        }
      }
    },
    [handleLikeUser, handleDislikeUser, loadMore, hasMore]
  );

  const handleLike = useCallback(() => {
    swipeCardRef.current?.handleChoice(1);
  }, []);

  const handleReject = useCallback(() => {
    swipeCardRef.current?.handleChoice(-1);
  }, []);

  // Update the type to match LikeUserResponse
  const handleMatch = useCallback((matchData: LikeUserResponse) => {
    console.log('handleMatch received data:', matchData);

    // Check if it's a match using both isMatch flag and status
    const isActualMatch =
      matchData && (matchData.isMatch || matchData.status === 'accepted');

    console.log('handleMatch - isActualMatch:', isActualMatch);

    if (isActualMatch) {
      let userData = {
        name: 'Your match',
        image: '',
      };

      // If matchedUser is available in the response, use it
      if (matchData.matchedUser) {
        userData = {
          name: matchData.matchedUser.full_name,
          image: matchData.matchedUser.profile_picture,
        };
        console.log('Using matchedUser data from response:', userData);
      }
      // If we have lastUserRef (the user that was just swiped/liked), use that instead
      else if (lastUserRef.current) {
        const profilePhoto =
          lastUserRef.current.photos?.find((p) => p.is_profile_picture)
            ?.photo_url ||
          (lastUserRef.current.photos && lastUserRef.current.photos.length > 0
            ? lastUserRef.current.photos[0].photo_url
            : '') ||
          '';

        userData = {
          name: lastUserRef.current.full_name || 'Your match',
          image: profilePhoto,
        };
        console.log('Using lastUserRef data:', userData);
      }

      console.log('Setting match data:', userData);

      // Update the matched user data and show popup immediately without delay
      setMatchedUser(userData);
      setMatchPopupVisible(true);
    } else {
      console.log('Match condition not met in handleMatch, popup not shown');
    }
  }, []);

  const handleSendMessage = useCallback(() => {
    setMatchPopupVisible(false);
    // Navigate to messages screen
    router.push('/messages');
  }, [router]);

  const handleKeepSwiping = useCallback(() => {
    setMatchPopupVisible(false);
  }, []);

  return {
    swipeCardRef,
    lastUserRef,
    currentUserRef,
    handleSwipeUserMatching,
    handleLike,
    handleReject,
    handleMatch,
    matchPopupVisible,
    matchedUser,
    currentUserImage,
    handleSendMessage,
    handleKeepSwiping,
  };
};
