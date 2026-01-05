import { apiClient } from './api';
import type { UserSettings } from '../types/types';

/** GET /settings/:userId */
export async function fetchUserSettings(userId: number): Promise<UserSettings> {
  try {
    const response = await apiClient.get(`/settings/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user settings:', error);
    throw error;
  }
}

/** POST /settings/:userId */
export async function updateUserSettings(userId: number, settings: UserSettings): Promise<void> {
  try {
    await apiClient.post(`/settings/${userId}`, settings);
  } catch (error) {
    console.error('Failed to update user settings:', error);
    throw error;
  }
}

/** DELETE /settings/:userId */
export async function resetUserSettings(userId: number): Promise<void> {
  try {
    await apiClient.delete(`/settings/${userId}`);
  } catch (error) {
    console.error('Failed to reset user settings:', error);
    throw error;
  }
}
