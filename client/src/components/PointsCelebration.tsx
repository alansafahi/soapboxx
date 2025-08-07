import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PointsCelebrationProps {
  points: number;
  reason: string;
  isVisible: boolean;
  onComplete: () => void;
}

const PointsCelebration: React.FC<PointsCelebrationProps> = ({
  points,
  reason,
  isVisible,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      // Animate progress bar over 3 seconds
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setTimeout(onComplete, 200); // Brief pause before hiding
            return 100;
          }
          return prev + 2; // Increment by 2% every 60ms = 3 seconds total
        });
      }, 60);

      return () => clearInterval(timer);
    } else {
      setProgress(0);
    }
  }, [isVisible, onComplete]);

  const getReason = (reason: string) => {
    const reasonMap: { [key: string]: string } = {
      'prayer_request': 'Prayer Request Posted',
      'discussion_post': 'Discussion Shared',
      'soap_entry': 'S.O.A.P. Study Completed',
      'daily_checkin': 'Daily Check-in',
      'qr_checkin': 'Event Check-in',
      'prayer_response': 'Prayer Offered',
      'discussion_like': 'Community Support',
      'achievement': 'Achievement Unlocked'
    };
    return reasonMap[reason] || 'Faithful Action';
  };

  const isNegative = points < 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-20 right-6 z-50 max-w-sm"
        >
          <div className={`rounded-lg border shadow-lg p-4 ${
            isNegative 
              ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
              : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isNegative 
                  ? 'bg-red-100 dark:bg-red-800/30' 
                  : 'bg-green-100 dark:bg-green-800/30'
              }`}>
                <span className="text-lg">
                  {isNegative ? '📉' : '✨'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-bold ${
                    isNegative 
                      ? 'text-red-700 dark:text-red-300' 
                      : 'text-green-700 dark:text-green-300'
                  }`}>
                    {isNegative ? '' : '+'}{points} points
                  </span>
                </div>
                <p className={`text-sm ${
                  isNegative 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {getReason(reason)}
                </p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <motion.div
                className={`h-1 rounded-full ${
                  isNegative 
                    ? 'bg-red-500 dark:bg-red-400' 
                    : 'bg-green-500 dark:bg-green-400'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PointsCelebration;