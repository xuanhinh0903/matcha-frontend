import { IPhoto } from '@/types/user.type';
import { useEffect, useRef, useState } from 'react';
import {
  BasicUserProfile,
  fetchBasicUserProfile,
  fetchUserInterests,
  fetchUserPhotos,
} from '../api/profileApi';
import { UserProfile } from '../types';

interface ProfileLoadingState {
  basicProfile: boolean;
  photos: boolean;
  interests: boolean;
}

export function useDiscoverProfile(id: string) {
  // State for storing each piece of data separately
  const [basicProfile, setBasicProfile] = useState<BasicUserProfile | null>(
    null
  );
  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  // Loading state for each data type
  const [loading, setLoading] = useState<ProfileLoadingState>({
    basicProfile: true,
    photos: true,
    interests: true,
  });

  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  // Combined profile data
  const profile: UserProfile | null = basicProfile
    ? {
        ...basicProfile,
        photos,
        interests,
        verified: true,
      }
    : null;

  // Set up the isMounted ref for cleanup - ONLY DO THIS ONCE
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load basic profile data first
  useEffect(() => {
    async function getBasicProfile() {
      try {
        const data = await fetchBasicUserProfile(id);
        // Only update state if the component is still mounted
        if (isMounted.current) {
          setBasicProfile(data);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err as Error);
          console.error('Error fetching basic profile:', err);
        }
      } finally {
        if (isMounted.current) {
          setLoading((prev) => ({ ...prev, basicProfile: false }));
        }
      }
    }

    if (id) {
      getBasicProfile();
    }

    // No cleanup needed here, we already have it in the main useEffect
  }, [id]);

  // Load photos after basic profile
  useEffect(() => {
    async function getPhotos() {
      try {
        const photoData = await fetchUserPhotos(id);
        if (isMounted.current) {
          setPhotos(photoData);
        }
      } catch (err) {
        if (isMounted.current) {
          console.error('Error fetching photos:', err);
        }
      } finally {
        if (isMounted.current) {
          setLoading((prev) => ({ ...prev, photos: false }));
        }
      }
    }

    if (id && basicProfile) {
      getPhotos();
    }

    // No cleanup needed here, we already have it in the main useEffect
  }, [id, basicProfile]);

  // Load interests after basic profile
  useEffect(() => {
    async function getInterests() {
      try {
        const interestData = await fetchUserInterests(id);
        console.log('🚀 ~ getInterests ~ interestData:', interestData);
        if (isMounted.current) {
          setInterests(interestData);
        }
      } catch (err) {
        if (isMounted.current) {
          console.error('Error fetching interests:', err);
        }
      } finally {
        if (isMounted.current) {
          setLoading((prev) => ({ ...prev, interests: false }));
        }
      }
    }

    if (id && basicProfile) {
      getInterests();
    }

    // No cleanup needed here, we already have it in the main useEffect
  }, [id, basicProfile]);

  // Provide all the loading states separately for detailed UI control
  return {
    profile,
    basicProfile,
    photos,
    interests,
    loading: {
      ...loading,
      any: loading.basicProfile || loading.photos || loading.interests,
      all: loading.basicProfile && loading.photos && loading.interests,
    },
    error,
  };
}
