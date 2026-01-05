import { apiClient } from './api';
import { AnalyticsData } from '../types/types';

/** POST /analytics */
export const sendAnalytics = async (data: AnalyticsData): Promise<void> => {
  try {
    await apiClient.post('/analytics', data);
  } catch (error) {
    console.error('Failed to send analytics event', error);
    throw error;
  }
};
