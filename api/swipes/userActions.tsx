// Tạo các hàm gọi API để lưu thông tin người dùng đã "liked" hoặc "nope"
import { client } from '../common/client';

export const likeUser = async (userId: string) => {
  try {
    const response = await client.post(`/match/like/${userId}`);
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error liking user:', error);
    throw error;
  }
};

export const nopeUser = async (userId: string) => {
  try {
    const response = await client.post(`/match/dislike/${userId}`);
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error nopeing user:', error);
    throw error;
  }
};
