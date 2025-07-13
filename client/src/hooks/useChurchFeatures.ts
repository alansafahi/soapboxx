import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import type { ChurchFeatureSetting } from '../../../shared/schema';

interface FeatureToggleData {
  isEnabled: boolean;
  configuration?: any;
}

export function useChurchFeatures(churchId: number) {
  return useQuery({
    queryKey: ['church-features', churchId],
    queryFn: () => fetch(`/api/church/${churchId}/features`, {
      credentials: 'include'
    }).then(res => res.json()) as Promise<ChurchFeatureSetting[]>
  });
}

export function useFeatureStatus(churchId: number, category: string, featureName: string) {
  return useQuery({
    queryKey: ['feature-status', churchId, category, featureName],
    queryFn: () => fetch(`/api/church/${churchId}/features/${category}/${featureName}/status`, {
      credentials: 'include'
    }).then(res => res.json()) as Promise<{ isEnabled: boolean }>
  });
}

export function useUpdateFeature(churchId: number) {
  return useMutation({
    mutationFn: async ({ category, featureName, data }: {
      category: string;
      featureName: string;
      data: FeatureToggleData;
    }) => {
      const response = await fetch(`/api/church/${churchId}/features/${category}/${featureName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update feature');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['church-features', churchId] });
      queryClient.invalidateQueries({ queryKey: ['feature-status', churchId] });
    },
  });
}

export function useInitializeChurchFeatures(churchId: number) {
  return useMutation({
    mutationFn: async (churchSize: string) => {
      const response = await fetch(`/api/church/${churchId}/features/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ churchSize }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to initialize church features');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['church-features', churchId] });
    },
  });
}

export function useDefaultFeatureSettings(churchSize: string) {
  return useQuery({
    queryKey: ['default-features', churchSize],
    queryFn: () => fetch(`/api/default-features/${churchSize}`, {
      credentials: 'include'
    }).then(res => res.json())
  });
}

// Helper hook to check if a specific feature is enabled
export function useIsFeatureEnabled(churchId: number, category: string, featureName: string) {
  const { data: statusData, isLoading } = useFeatureStatus(churchId, category, featureName);
  
  return {
    isEnabled: statusData?.isEnabled ?? true, // Default to enabled if not found
    isLoading
  };
}