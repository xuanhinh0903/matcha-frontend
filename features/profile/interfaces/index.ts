export interface ProfileFormData {
  full_name: string;
  phone_number: string;
  bio: string;
  birthdate?: string; // ISO date string
  gender?: 'male' | 'female' | 'other' | null;
  interests?: number[]; // array of interest IDs
}

export interface Photo {
  photo_id: number;
  photo_url: string;
  is_profile_picture?: boolean;
}

export interface Interest {
  interest_id: number;
  interest_name: string;
  interest: Interest;
}
export type PrivacyLevel = 'private' | 'matches' | 'public';

export interface PrivacySettings {
  photos: PrivacyLevel;
  bio: PrivacyLevel;
  age: PrivacyLevel;
  interests: PrivacyLevel;
  // matchStats: PrivacyLevel;
}
