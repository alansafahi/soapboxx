import { useMemo } from 'react';
import { useIsFeatureEnabled } from './useChurchFeatures';

// Feature mapping for navigation items
const FEATURE_NAVIGATION_MAP: Record<string, { category: string; feature: string }> = {
  // Community features
  'churches': { category: 'community', feature: 'churches' },
  'events': { category: 'community', feature: 'events' },
  'discussions': { category: 'community', feature: 'discussions' },
  'donation': { category: 'community', feature: 'donation' },
  'sms-giving': { category: 'community', feature: 'donation' }, // Legacy name mapping
  
  // Spiritual Tools features
  'prayer-wall': { category: 'spiritual_tools', feature: 'prayer_wall' },
  'audio-bible': { category: 'spiritual_tools', feature: 'audio_bible' },
  'audio-routines': { category: 'spiritual_tools', feature: 'audio_routines' },
  
  // Media Contents features
  'video-library': { category: 'media_contents', feature: 'video_library' },
  'image-gallery': { category: 'media_contents', feature: 'image_gallery' },
  
  // Admin Portal features
  'communication-hub': { category: 'admin_portal', feature: 'communication_hub' },
  'sermon-studio': { category: 'admin_portal', feature: 'sermon_studio' },
};

// Core features that are always visible (never toggleable)
const CORE_FEATURES = [
  'home',
  'messages', 
  'contacts',
  'leaderboard', // Engagement Board
  'profile',
  'settings',
  'today-reading', // S.O.A.P. Journal - always available for spiritual growth
  'bookmarked-prayers', // Bookmarked Prayers - always available spiritual feature
  'member-directory', // Always needed for admin
  'donation-analytics', // Always needed for admin
  'engagement-analytics', // Always needed for admin
  'church-management', // SoapBox Portal - always available
  'moderation-dashboard' // Content Moderation - always available for authorized users
];

export function useFeatureFilter(churchId: number | null) {
  return useMemo(() => {
    const isFeatureEnabled = (itemKey: string): boolean => {
      // Always show core features
      if (CORE_FEATURES.includes(itemKey)) {
        return true;
      }

      // If no church context, show all features (fallback)
      if (!churchId) {
        return true;
      }

      // Check if this item maps to a toggleable feature
      const featureMapping = FEATURE_NAVIGATION_MAP[itemKey];
      if (!featureMapping) {
        return true; // Show if not mapped (safety fallback)
      }

      // This would need to be implemented with actual feature checking
      // For now, return true as a fallback
      return true;
    };

    const filterNavigationItems = (items: any[]) => {
      return items.filter(item => {
        // Handle nested items (submenus)
        if (item.items) {
          const filteredSubItems = item.items.filter((subItem: any) => 
            isFeatureEnabled(subItem.key || subItem.href?.slice(1) || '')
          );
          // Only show parent if it has enabled sub-items
          return filteredSubItems.length > 0;
        }
        
        // Handle direct items
        return isFeatureEnabled(item.key || item.href?.slice(1) || '');
      });
    };

    return {
      isFeatureEnabled,
      filterNavigationItems
    };
  }, [churchId]);
}

// Hook for individual feature status checking
export function useFeatureAccess(churchId: number | null, featureKey: string) {
  const featureMapping = FEATURE_NAVIGATION_MAP[featureKey];
  
  const { isEnabled: featureEnabled, isLoading } = useIsFeatureEnabled(
    churchId || 0,
    featureMapping?.category || '',
    featureMapping?.feature || ''
  );

  // Always enable core features
  const isCoreFeature = CORE_FEATURES.includes(featureKey);
  const isEnabled = isCoreFeature || featureEnabled;

  return {
    isEnabled,
    isLoading: isCoreFeature ? false : isLoading,
    isCoreFeature
  };
}