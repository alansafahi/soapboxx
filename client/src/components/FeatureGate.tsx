import React from 'react';
import { useFeatureAccess } from '../hooks/useFeatureFilter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

interface FeatureGateProps {
  featureKey: string;
  churchId: number | null;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showDisabledMessage?: boolean;
}

export default function FeatureGate({ 
  featureKey, 
  churchId, 
  children, 
  fallback = null,
  showDisabledMessage = false 
}: FeatureGateProps) {
  const { isEnabled, isLoading, isCoreFeature } = useFeatureAccess(churchId, featureKey);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!isEnabled) {
    if (showDisabledMessage) {
      return (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            This feature has been disabled by your church administrator.
          </AlertDescription>
        </Alert>
      );
    }
    return fallback;
  }

  return <>{children}</>;
}

// Convenience hook for conditional rendering
export function useConditionalRender(featureKey: string, churchId: number | null) {
  const { isEnabled, isLoading } = useFeatureAccess(churchId, featureKey);
  
  return {
    shouldRender: isEnabled,
    isLoading
  };
}