import { client } from '../common/client';
import { BASE_URL as apiEndpoint } from '../../constants';
import {
  AdminReportListResponse,
  AdminReportDetailResponse,
  ResolveReportRequest,
  ResolveReportResponse,
} from '../types';

/**
 * Get all reports with optional filtering
 */
export const getReports = async (
  filter?: string
): Promise<AdminReportListResponse> => {
  try {
    const url = filter
      ? `${apiEndpoint}/reports?filter=${filter}`
      : `${apiEndpoint}/reports`;
    const response = await client.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get report details by ID
 */
export const getReportById = async (
  reportId: number
): Promise<AdminReportDetailResponse> => {
  try {
    const response = await client.get(`${apiEndpoint}/reports/${reportId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Resolve a report with action (ignore, ban, delete)
 */
export const resolveReport = async (
  reportId: number,
  data: ResolveReportRequest
): Promise<ResolveReportResponse> => {
  try {
    const response = await client.patch(
      `${apiEndpoint}/reports/${reportId}/resolve`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
