import { IPhoto } from '@/types/user.type';

export interface UserProfile {
  verified: any;
  user_id: string;
  full_name: string;
  age: number;
  bio: string;
  location: {
    coordinates: [number, number];
  };
  photos: IPhoto[];
  interests: string[];
  last_active: string;
  is_online: boolean;
  distance: number;
}
