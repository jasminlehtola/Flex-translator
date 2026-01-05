import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserSettings, resetUserSettings } from '../api/settingsApiClient';
import { settingsQueryOptions } from '../utils/queryOptions';
import type { UserSettings } from '../types/types';

export const useSettings = (userId: number) => {
  const queryClient = useQueryClient();

  const { data: settings, ...query } = useQuery<UserSettings>(settingsQueryOptions(userId));

  const save = useMutation({
    mutationFn: (newSettings: UserSettings) => updateUserSettings(userId, newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryOptions(userId).queryKey });
    },
  });

  const reset = useMutation({
    mutationFn: () => resetUserSettings(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryOptions(userId).queryKey });
    },
  });

  return {
    settings,
    query,
    saveSettings: save,
    resetSettings: reset,
  };
};
