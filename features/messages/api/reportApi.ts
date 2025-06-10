import { client } from '@/api/common/client';

export interface ReportUserParams {
  reportedUserId: number;
  reportReason: string;
  details: string;
  files?: { uri: string; name?: string; type?: string }[];
}

export const reportUserApi = async (params: ReportUserParams) => {
  // Create FormData object once
  const formData = new FormData();
  formData.append('reportedUserId', String(params.reportedUserId));
  formData.append('reportReason', params.reportReason);
  formData.append('details', params.details);

  // Add files to FormData with proper mime type detection
  if (params.files && params.files.length > 0) {
    params.files.forEach((file, index) => {
      const photoUri = file.uri;
      const filename =
        file.name || photoUri.split('/').pop() || `evidence_${index}.jpg`;

      // Get mime type based on file extension
      const fileExtension = filename.split('.').pop()?.toLowerCase() || 'jpeg';
      const mimeType =
        fileExtension === 'png'
          ? 'image/png'
          : fileExtension === 'gif'
          ? 'image/gif'
          : 'image/jpeg';

      // Append to formData with proper typing
      formData.append('files', {
        uri: photoUri,
        type: file.type || mimeType,
        name: filename,
      } as any);
    });
  }

  console.log('Report payload:', {
    reportedUserId: params.reportedUserId,
    reportReason: params.reportReason,
    details: params.details,
    filesCount: params.files?.length || 0,
  });

  try {
    // Use a simpler approach with default content-type handling
    const response = await client.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting report:', error);
    throw error;
  }
};
