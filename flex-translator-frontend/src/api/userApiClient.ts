import { apiClient } from './api';

/** GET /user **/
export async function fetchUserInfo() {
  try {
    const response = await apiClient.get('/userinfo/current_user');
    return response.data;
  } catch (error) {
    console.log('Failed to get user data.');
    throw error;
  }
}
