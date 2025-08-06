import { useState, useEffect } from 'react';
import { Star, Heart, Award, Cross, Gift } from 'lucide-react';
import { Button } from './button';

interface AchievementCelebrationProps {
  achievement: {
    type: 'streak' | 'badge' | 'mission' | 'milestone';
    title: string;
    description: string;
    points?: number;
    streak?: number;
    icon?: string;
  };
  onClose: () => void;
  show: boolean;
}

const AchievementCelebration = ({ achievement, onClose, show }: AchievementCelebrationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    }
  }, [show]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (achievement.type) {
      case 'streak':
        return <Star className="w-8 h-8 text-yellow-500" />;
      case 'badge':
        return <Award className="w-8 h-8 text-purple-500" />;
      case 'mission':
        return <Cross className="w-8 h-8 text-blue-500" />;
      default:
        return <Heart className="w-8 h-8 text-red-500" />;
    }
  };

  const getGraceMessage = () => {
    switch (achievement.type) {
      case 'streak':
        return `Congratulations on your ${achievement.streak}-day journey of faithful devotion! You've grown in discipline and consistency.`;
      case 'badge':
        return `You've earned a new spiritual milestone! Your faithful service has been recognized.`;
      case 'mission':
        return `You've completed your spiritual mission! Your dedication to growth inspires others.`;
      default:
        return `Your spiritual journey continues to flourish! Keep walking in faith.`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center animate-in zoom-in duration-300">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            {getIcon()}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {achievement.title}
          </h2>
          <p className="text-purple-600 font-semibold mb-3">
            {getGraceMessage()}
          </p>
          <p className="text-gray-600 text-sm">
            {achievement.description}
          </p>
          {achievement.points && (
            <div className="mt-4 inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
              <Gift className="w-4 h-4" />
              {achievement.points} points added to your journey
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-full shadow-lg"
          >
            Continue Your Journey
          </Button>
          <p className="text-xs text-gray-500">
            "Well done, good and faithful servant" - Matthew 25:21
          </p>
        </div>
      </div>
    </div>
  );
};

export default AchievementCelebration;