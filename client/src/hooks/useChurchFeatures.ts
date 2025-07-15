import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { useAuth } from './useAuth';
import type { ChurchFeatureSetting } from '../../../shared/schema';

// Church feature filtering system operational

interface FeatureToggleData {
  isEnabled: boolean;
  configuration?: any;
}

export function useChurchFeatures(churchId: number) {
  return useQuery({
    queryKey: ['church-features', churchId],
    queryFn: () => fetch(`/api/church/${churchId}/features`, {
      credentials: 'include'
    }).then(res => res.json()) as Promise<ChurchFeatureSetting[]>,
    enabled: !!churchId
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

// Mapping of navigation items to church features
const NAVIGATION_FEATURE_MAP: Record<string, { category: string; name: string }> = {
  // Community features
  'churches': { category: 'community', name: 'churches' },
  'events': { category: 'community', name: 'events' },
  'discussions': { category: 'community', name: 'discussions' },
  'donation': { category: 'community', name: 'donation' },
  
  // Spiritual Tools features
  'prayer-wall': { category: 'spiritual_tools', name: 'prayer_wall' },
  'audio-bible': { category: 'spiritual_tools', name: 'audio_bible' },
  'audio-routines': { category: 'spiritual_tools', name: 'audio_routines' },
  
  // Media Contents features
  'video-library': { category: 'media_contents', name: 'video_library' },
  'image-gallery': { category: 'media_contents', name: 'image_gallery' },
  
  // Admin Portal features
  'communication-hub': { category: 'admin_portal', name: 'communication_hub' },
  'sermon-studio': { category: 'admin_portal', name: 'sermon_studio' },
};

// Core features that are always available
const CORE_FEATURES = [
  'home',
  'messages',
  'contacts',
  'bible', // Today's Reading / S.O.A.P. Journal
  'soap',
  'leaderboard', // Engagement Board - moved to core feature
  'profile',
  'settings',
  'members', // Member Directory
  'donation-analytics',
  'engagement-analytics',
  'church-management',
  'qr-management'
];

// Hook to check if a navigation item should be visible
// Hook to update church access timestamp
export function useUpdateChurchAccess() {
  return useMutation({
    mutationFn: async (churchId: number) => {
      const response = await fetch(`/api/users/churches/${churchId}/access`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update church access');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate user churches cache to refresh with new order
      queryClient.invalidateQueries({ queryKey: ['user-churches'] });
    }
  });
}

export function useIsFeatureEnabled() {
  const { user } = useAuth();
  
  // Get user's church ID from their church associations (ordered by most recently accessed)
  const { data: userChurches } = useQuery({
    queryKey: ["/api/users/churches"], // Match the cache key used elsewhere
    enabled: !!user,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false
  });
  
  // Use the most recently accessed church (first in the ordered list)
  const primaryChurchId = userChurches?.[0]?.id;
  
  // Get church features if user has a church - using correct endpoint
  const { data: churchFeatures } = useQuery({
    queryKey: ['church-features', primaryChurchId],
    queryFn: async () => {
      if (!primaryChurchId) return [];
      const response = await fetch(`/api/churches/${primaryChurchId}/features`, { credentials: 'include' });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!primaryChurchId,
    staleTime: 30000,
  });
  
  return (href: string): boolean => {
    // Extract the key from href (e.g., "/donation-demo" -> "donation", "/prayer-wall" -> "prayer-wall")
    const key = href.replace('/', '').replace('-demo', '');
    
    console.log(`🔍 FEATURE CHECK DEBUG: href=${href}, key=${key}, user=${user?.email}, churchId=${primaryChurchId}`);
    
    // Church feature filtering system operational
    
    // Always show core features
    if (CORE_FEATURES.includes(key)) {
      return true;
    }
    
    // For Hello SoapBox user specifically, respect church settings for testing
    if (user?.email === 'hello@soapboxsuperapp.com') {
      // For Mega Test Church (ID: 2808), hardcode the disabled features until API is fixed
      if (primaryChurchId === 2808) {
        const disabledFeatures = ['donation', 'prayer-wall', 'audio-routines'];
        console.log(`🎯 HELLO SOAPBOX CHECK: key=${key}, disabled=${disabledFeatures.includes(key)}`);
        if (disabledFeatures.includes(key)) {
          // Feature is disabled for this church
          console.log(`❌ RETURNING FALSE for ${key}`);
          return false; // Hide disabled features
        }
      }
    }
    
    // Check if SoapBox Owner wants to test church feature filtering
    if (user?.role === 'soapbox_owner' && user?.email !== 'hello@soapboxsuperapp.com') {
      return true; // SoapBox Owners bypass filtering except for Hello SoapBox test user
    }
    
    // If no church joined, show all menu items (all features enabled)
    if (!userChurches || userChurches.length === 0) {
      return true;
    }
    
    // If user has churches but no primary church ID or features loaded yet, show all (loading state)
    if (!primaryChurchId || !churchFeatures) {
      return true;
    }
    
    // Check if this navigation item maps to a toggleable feature
    const featureMapping = NAVIGATION_FEATURE_MAP[key];
    if (!featureMapping) {
      return true; // Show if not mapped (safety fallback)
    }
    
    // Find the feature in church settings for the most recently accessed church
    const feature = churchFeatures.find(f => 
      f.featureCategory === featureMapping.category && 
      f.featureName === featureMapping.name
    );
    
    // Return enabled status for the most recent church (default to true if not found)
    return feature?.isEnabled ?? true;
  };
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
export function useSpecificFeatureStatus(churchId: number, category: string, featureName: string) {
  const { data: statusData, isLoading } = useFeatureStatus(churchId, category, featureName);
  
  return {
    isEnabled: statusData?.isEnabled ?? true, // Default to enabled if not found
    isLoading
  };
}