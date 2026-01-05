import { useMutation } from '@tanstack/react-query';
import { sendAnalytics } from '../api/analyticsApiClient';
import { AnalyticsData } from '../types/types';

export function useSendAnalytics() {
  return useMutation({
    mutationFn: (data: AnalyticsData) => sendAnalytics(data),
  });
}
