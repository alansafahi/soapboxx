import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface CelebrationData {
  points: number;
  reason: string;
  isVisible: boolean;
}

// Hook to manage points celebration and real-time updates
export const usePointsCelebration = () => {
  const [celebration, setCelebration] = useState<CelebrationData>({
    points: 0,
    reason: '',
    isVisible: false,
  });

  const queryClient = useQueryClient();

  // Real-time points query
  const { data: userPoints, refetch: refetchPoints } = useQuery({
    queryKey: ['/api/user/points/realtime'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const showCelebration = (points: number, reason: string) => {
    setCelebration({
      points,
      reason,
      isVisible: true,
    });

    // Invalidate points cache to trigger immediate refresh
    queryClient.invalidateQueries({ queryKey: ['/api/user/points/realtime'] });
    refetchPoints();
  };

  const hideCelebration = () => {
    setCelebration(prev => ({ ...prev, isVisible: false }));
  };

  // Auto-update points when celebration is shown
  useEffect(() => {
    if (celebration.isVisible) {
      // Delay the points refetch slightly to ensure backend has processed the points
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/user/points/realtime'] });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      }, 500);
    }
  }, [celebration.isVisible, queryClient]);

  return {
    celebration,
    showCelebration,
    hideCelebration,
    userPoints,
    refetchPoints,
  };
};