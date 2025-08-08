import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface UpgradeFlowState {
  showUpgradeFlow: boolean;
  trigger: "complete" | "mid-plan" | "locked-feature" | "pastor-invite" | null;
  planData?: any;
}

interface User {
  id: string;
  firstName: string;
  subscriptionTier?: string;
}

export function useUpgradeFlow(planId?: number, currentDay?: number, totalDays?: number) {
  const [upgradeState, setUpgradeState] = useState<UpgradeFlowState>({
    showUpgradeFlow: false,
    trigger: null,
  });

  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });

  // Check for plan completion trigger
  const checkPlanCompletion = (day: number, total: number) => {
    if (day === total && user?.subscriptionTier === 'disciple') {
      setUpgradeState({
        showUpgradeFlow: true,
        trigger: "complete",
        planData: { id: planId, currentDay: day, totalDays: total }
      });
    }
  };

  // Check for mid-plan nudge trigger
  const checkMidPlanNudge = (day: number, total: number) => {
    const progressPercentage = (day / total) * 100;
    if (progressPercentage >= 50 && progressPercentage < 55 && user?.subscriptionTier === 'disciple') {
      setUpgradeState({
        showUpgradeFlow: true,
        trigger: "mid-plan",
        planData: { id: planId, currentDay: day, totalDays: total, completionPercentage: progressPercentage }
      });
    }
  };

  // Trigger locked feature modal
  const triggerLockedFeature = (featureName: string = "Advanced Features") => {
    const canAccess = user?.subscriptionTier === 'torchbearer' || 
                     (user?.subscriptionTier === 'servant' && featureName.includes('AI'));
    
    if (!canAccess) {
      setUpgradeState({
        showUpgradeFlow: true,
        trigger: "locked-feature",
        planData: { featureName }
      });
    }
    
    return canAccess;
  };

  // Check upgrade triggers when plan progress changes
  useEffect(() => {
    if (planId && currentDay && totalDays && user) {
      // Check for completion
      if (currentDay === totalDays) {
        checkPlanCompletion(currentDay, totalDays);
      }
      
      // Check for mid-plan nudge (only once around 50%)
      if (!upgradeState.showUpgradeFlow) {
        checkMidPlanNudge(currentDay, totalDays);
      }
    }
  }, [planId, currentDay, totalDays, user]);

  const closeUpgradeFlow = () => {
    setUpgradeState({
      showUpgradeFlow: false,
      trigger: null,
    });
  };

  const handleUpgradeSuccess = (result: string) => {
    if (result === 'success') {
      closeUpgradeFlow();
      // Optionally trigger a success toast or redirect
    }
  };

  return {
    ...upgradeState,
    triggerLockedFeature,
    closeUpgradeFlow,
    handleUpgradeSuccess,
    userTier: user?.subscriptionTier || 'disciple',
  };
}