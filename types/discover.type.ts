import { ReactNode } from 'react';
import { User, ILocation, IPhoto } from './user.type';

export type TDiscoverInteraction = 'like' | 'reject';

export interface IFindPeopleParams {
  page: number;
  limit: number;
  lat?: number;
  lon?: number;
  gender?: string;
  range?: number;
  minAge?: number;
  maxAge?: number;
}

export type IDiscoverInteractionRequest = {
  userIdTransmitter: number;
  userIdReceiver: number;
  interaction: TDiscoverInteraction;
};

export interface IDiscoverUser extends User {
  name: ReactNode;
  last_active: string;
  is_online: boolean;
  photos: IPhoto[];
  age: number;
  distance: number;
  city?: string; // Added city property as optional
  liked_at?: string;
  current_user_photo?: string; // Add current user's photo for the match popup
}

export interface IDiscoverPeopleResponse {
  users: IDiscoverUser[];
  total: number;
  page: number;
  limit: number;
}
