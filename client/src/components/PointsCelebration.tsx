import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PointsCelebrationProps {
  points: number;
  reason: string;
  isVisible: boolean;
  onComplete: () => void;
}

export const PointsCelebration: React.FC<PointsCelebrationProps> = ({
  points,
  reason,
  isVisible,
  onComplete,
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowAnimation(true);
      // Auto-hide after animation completes
      const timer = setTimeout(() => {
        setShowAnimation(false);
        onComplete();
      }, 3000); // 3 seconds total duration

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  const formatReason = (reason: string) => {
    const reasonMap: Record<string, string> = {
      discussion_post: 'Discussion Created',
      discussion_like: 'Discussion Liked',
      discussion_unlike: 'Like Removed',
      comment_like: 'Comment Liked',
      comment_unlike: 'Comment Like Removed',
      prayer_request: 'Prayer Request',
      prayer_response: 'Prayer Response',
      soap_entry: 'S.O.A.P. Entry',
      soap_streak_7: '7-Day S.O.A.P. Streak!',
      event_attended: 'Event Attended',
      volunteering: 'Event Volunteering',
      contact_added: 'Contact Added',
      group_created: 'Group Created',
      group_joined: 'Group Joined',
      referral_reward: 'Referral Reward',
      ai_first_use: 'First AI Usage',
      daily_checkin: 'Daily Check-in',
      qr_checkin: 'QR Check-in',
    };
    return reasonMap[reason] || reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const isNegative = points < 0;
  const displayPoints = Math.abs(points);

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed top-20 right-6 z-50 pointer-events-none"
        >
          <div className={`
            bg-white dark:bg-gray-800 
            border-2 ${isNegative ? 'border-red-200 dark:border-red-700' : 'border-green-200 dark:border-green-700'} 
            rounded-lg shadow-lg p-4 min-w-[200px]
          `}>
            <div className="flex items-center space-x-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isNegative 
                    ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300' 
                    : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                  }
                `}
              >
                {isNegative ? '-' : '+'}
              </motion.div>
              
              <div className="flex-1">
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`text-lg font-semibold ${
                    isNegative 
                      ? 'text-red-600 dark:text-red-300' 
                      : 'text-green-600 dark:text-green-300'
                  }`}
                >
                  {isNegative ? '-' : '+'}{displayPoints} {displayPoints === 1 ? 'Point' : 'Points'}
                </motion.div>
                
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-gray-600 dark:text-gray-300"
                >
                  {formatReason(reason)}
                </motion.div>
              </div>
            </div>

            {/* Gentle fade-out indicator */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ delay: 0.5, duration: 2.5, ease: "linear" }}
              className={`h-1 rounded-full mt-3 ${
                isNegative 
                  ? 'bg-red-200 dark:bg-red-700' 
                  : 'bg-green-200 dark:bg-green-700'
              }`}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook to manage points celebration
export const usePointsCelebration = () => {
  const [celebration, setCelebration] = useState<{
    points: number;
    reason: string;
    isVisible: boolean;
  }>({
    points: 0,
    reason: '',
    isVisible: false,
  });

  const showCelebration = (points: number, reason: string) => {
    setCelebration({
      points,
      reason,
      isVisible: true,
    });
  };

  const hideCelebration = () => {
    setCelebration(prev => ({ ...prev, isVisible: false }));
  };

  return {
    celebration,
    showCelebration,
    hideCelebration,
  };
};