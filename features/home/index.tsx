import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, SafeAreaView, View } from 'react-native';

import { isTokenExpired } from '@/helpers/auth.helper';
import { useDiscoverData } from '@/hooks/use-discover-data';
import { getAuthToken } from '@/store/global/auth/auth.slice';
import { IDiscoverUser } from '@/types';
import { useFocusEffect } from 'expo-router';
import { useSelector } from 'react-redux';
import { MatchPopup } from './components';
import { Discover } from './components/Discover';
import { DiscoverStyleSheet } from './styles';

const USERS_PER_PAGE = 10;

const HomePage = () => {
  const [page, setPage] = useState(1);
  const [allUsers, setAllUsers] = useState<IDiscoverUser[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  // Track initialization status
  const initializedRef = useRef(false);
  const pendingRefetchRef = useRef(false);

  const authToken = useSelector(getAuthToken);
  const isAuthenticated = authToken && !isTokenExpired(authToken);

  const {
    data: recommendedUser,
    refetch,
    isFetching,
    getLocation,
    formattedLocation, // Use the formatted location from the hook
    isSuccess,
    // Add these fields to detect initialization status
    isUninitialized,
    isError,
  } = useDiscoverData(page, USERS_PER_PAGE, false);

  // Safely refetch only when query is properly initialized
  const safeRefetch = useCallback(() => {
    if (isUninitialized) {
      // Query not initialized yet, set a flag to refetch later
      pendingRefetchRef.current = true;
      return;
    }

    // Only refetch if the query is initialized (not in uninitialized state)
    if (!isUninitialized) {
      try {
        refetch();
      } catch (error) {
        console.error('Failed to refetch:', error);
      }
    }
  }, [isUninitialized]);

  // Initialize location when the component mounts
  useEffect(() => {
    let isMounted = true;

    if (isAuthenticated && !initializedRef.current) {
      getLocation().then(() => {
        if (isMounted) {
          initializedRef.current = true;

          // If there was a pending refetch, execute it now
          if (pendingRefetchRef.current) {
            safeRefetch();
            pendingRefetchRef.current = false;
          }
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Handle focus changes
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);

      // Only fetch data when focused and initialized
      if (isAuthenticated && initializedRef.current) {
        safeRefetch();
      }

      return () => {
        setIsFocused(false);
      };
    }, [isAuthenticated])
  );

  // Update allUsers when new data arrives
  useEffect(() => {
    if (recommendedUser?.users?.length) {
      if (page === 1) {
        // Reset users if it's the first page
        setAllUsers(recommendedUser.users);
      } else {
        // Append users for subsequent pages
        setAllUsers((prev) => [...prev, ...recommendedUser.users]);
      }

      // Check if we received fewer users than requested, indicating end of data
      if (recommendedUser.users.length < USERS_PER_PAGE) {
        setHasMore(false);
      }
    } else if (
      recommendedUser &&
      recommendedUser.users &&
      recommendedUser.users.length === 0
    ) {
      // No users returned, end of data
      setHasMore(false);
    }
  }, [recommendedUser, page]);

  // Load more users
  const loadMoreUsers = useCallback(() => {
    if (!isFetching && hasMore && initializedRef.current) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [isFetching, hasMore]);

  // Function to refresh and start from page 1
  const handleRefresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setAllUsers([]);

    // Only refetch if initialized and focused
    if (isFocused && initializedRef.current) {
      safeRefetch();
    }
  }, [isFocused]);

  // Only fetch when page changes AND focused AND initialized
  useEffect(() => {
    if (isAuthenticated && isFocused && initializedRef.current && page > 1) {
      safeRefetch();
    }
  }, [page, isAuthenticated, isFocused]);

  return (
    <>
      <SafeAreaView style={DiscoverStyleSheet.container}>
        <View style={DiscoverStyleSheet.header}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={DiscoverStyleSheet.logo}
            resizeMode="contain"
          />
        </View>
        <View style={DiscoverStyleSheet.discoverWrapper}>
          <Discover
            peopleToDiscover={allUsers}
            refetch={handleRefresh}
            loadMore={loadMoreUsers}
            isLoading={isFetching}
            hasMore={hasMore}
            userLocation={formattedLocation}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default React.memo(HomePage);
