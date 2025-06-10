import { Participant } from '../types/message.type';

export const convertToParticipant = (user: any): Participant => ({
  user_id: user.user_id,
  full_name: user.full_name || 'Unknown User',
  photo_url: user.photo_url,
  is_online: user.is_online || false,
  phone_number: user.phone_number || undefined,
  bio: user.bio || undefined,
  location: user.location || undefined,
});
