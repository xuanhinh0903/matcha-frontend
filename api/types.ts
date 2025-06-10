export type PaginateQuery<T> = {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
};

// Admin Types
export interface ReportedUser {
  user_id: number;
  username: string;
  email: string;
  full_name?: string;
  profile_photo?: string;
  is_banned: boolean;
  ban_expires_at?: string;
}

export interface ReportImage {
  image_id: number;
  original_url: string;
  thumbnail_url: string;
}

export interface Report {
  report_id: number;
  reporter: {
    user_id: number;
    username: string;
    profile_photo?: string;
  };
  reported: ReportedUser;
  report_reason:
    | 'fake_profile'
    | 'inappropriate_content'
    | 'harassment'
    | 'other';
  details?: string;
  status: 'pending' | 'reviewed' | 'closed';
  images: ReportImage[];
  created_at: string;
}

export type AdminReportListResponse = Report[];

export interface AdminReportDetailResponse extends Report {}

export interface ResolveReportRequest {
  action: 'ignore' | 'ban' | 'delete';
  reason?: string;
  banDays?: number;
}

export interface ResolveReportResponse {
  success: boolean;
  message: string;
}
