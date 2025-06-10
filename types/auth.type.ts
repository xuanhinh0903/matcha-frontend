import { Interest } from '@/features/profile/interfaces';

export type TSignInRequest = {
  email: string;
  password: string;
};

export type TSignInResponse = {
  email: string;
  token: string;
};

export type TSignUpRequest = {
  name: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
  description: string;
  genderId: number;
  countryId: number;
  genderToMatchId: number;
};

export type TSignUpResponse = {
  id: number;
  email: string;
};

export type TGetProfileResponse = {
  photos: any;
  user_id: number;
  email: string;
  phone_number: string | null;
  full_name: string | null;
  birthdate: string;
  gender: 'male' | 'female' | 'other' | null;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  } | null;
  bio: string | null;
  created_at: string;
  updated_at: string;

  is_verified: boolean;
  interests?: Interest[];
  photo_url_thumbnail?: string | null;
  profile_thumbnail?: string | null;
};
