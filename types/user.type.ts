export interface ILocation {
  type: 'Point';
  coordinates: [number, number];
}

export interface IPhoto {
  url: string | undefined;
  photo_id: number;
  photo_url: string;
  public_id: string;
  photo_url_thumbnail: string;
  is_profile_picture: boolean;
  uploaded_at: string;
}

export interface User {
  user_id: number;
  email: string;
  phone_number: string | null;
  full_name: string | null;
  birthdate: string;
  gender: 'male' | 'female' | 'other' | null;
  location: ILocation | null;
  bio: string | null;
  last_active?: string;
  is_online?: boolean;
  created_at: string;
  updated_at: string;
  photos?: IPhoto[];
  age?: number;
  distance?: number;
}
