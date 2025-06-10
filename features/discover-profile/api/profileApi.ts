import { client } from '@/api/common/client';
import { UserProfile } from '../types';
import { IPhoto } from '@/types/user.type';

// Basic profile data without photos and interests
export interface BasicUserProfile {
  user_id: string;
  full_name: string;
  age: number;
  bio: string;
  location: {
    coordinates: [number, number];
  };
  last_active: string;
  is_online: boolean;
  distance: number;
  gender?: string;
}

// Original method - fetches all data at once
export async function fetchUserProfile(id: string): Promise<UserProfile> {
  try {
    const response = await client.get(`/user/profile/${id}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Optimized methods - fetch data in parts
export async function fetchBasicUserProfile(
  id: string
): Promise<BasicUserProfile> {
  try {
    const response = await client.get(`/user/profile/${id}/basic`);
    return response.data;
  } catch (error) {
    console.error('API Error fetching basic profile:', error);
    // Fallback to full profile fetch if the endpoint doesn't exist yet
    const fullProfile = await fetchUserProfile(id);
    const { photos, interests, ...basicProfile } = fullProfile;
    return basicProfile;
  }
}

export async function fetchUserPhotos(id: string): Promise<IPhoto[]> {
  try {
    const response = await client.get(`/user/profile/${id}/photos`);
    return response.data;
  } catch (error) {
    console.error('API Error fetching photos:', error);
    // Fallback to full profile fetch if the endpoint doesn't exist yet
    const fullProfile = await fetchUserProfile(id);
    return fullProfile.photos || [];
  }
}

export async function fetchUserInterests(id: string): Promise<string[]> {
  try {
    const response = await client.get(`/user/profile/${id}/interests`);
    return response.data;
  } catch (error) {
    console.error('API Error fetching interests:', error);
    // Fallback to full profile fetch if the endpoint doesn't exist yet
    const fullProfile = await fetchUserProfile(id);
    return fullProfile.interests || [];
  }
}
