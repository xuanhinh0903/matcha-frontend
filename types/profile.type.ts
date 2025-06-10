export type TGetProfileStatsResponse = {
  user_id: number;

  matchStats?: {
    totalMatches: number;
    likesReceived: number;
    matchRate: number;
  };
};

export type TGetProfilePhotosResponse = {
  photo_id: number;

  photo_url: string;

  public_id: string;

  photo_url_thumbnail: string;

  is_profile_picture: boolean;

  uploaded_at: Date;
};
