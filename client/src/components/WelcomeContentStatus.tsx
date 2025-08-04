import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { CheckCircle, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { apiRequest } from '../lib/queryClient';

interface WelcomeContentStatusProps {
  onComplete?: () => void;
  onViewContent?: (content: any) => void;
}

export default function WelcomeContentStatus({ onComplete, onViewContent }: WelcomeContentStatusProps) {
  const [status, setStatus] = useState<{
    isGenerated: boolean;
    hasContent: boolean;
    content?: any;
  }>({ isGenerated: false, hasContent: false });
  const [isChecking, setIsChecking] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    checkWelcomeContentStatus();
    
    // Simulate progress while waiting
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 1000);

    // Check status every 3 seconds until content is ready
    const statusInterval = setInterval(() => {
      if (!status.isGenerated) {
        checkWelcomeContentStatus();
      }
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
    };
  }, [status.isGenerated]);

  const checkWelcomeContentStatus = async () => {
    try {
      const response = await apiRequest('/api/users/welcome-content-status', {
        method: 'GET'
      });
      setStatus(response);
      
      if (response.isGenerated && response.hasContent) {
        setProgress(100);
        setIsChecking(false);
      }
    } catch (error) {
      console.error('Failed to check welcome content status:', error);
      setIsChecking(false);
    }
  };

  if (status.isGenerated && status.hasContent) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-900 dark:text-green-100">
            Your Spiritual Welcome Package is Ready!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-green-700 dark:text-green-300">
            We've created personalized spiritual content based on your assessment responses.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => onViewContent?.(status.content)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              View Your Welcome Package
            </Button>
            <Button
              variant="outline"
              onClick={onComplete}
              className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              Continue to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
          <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400 animate-pulse" />
        </div>
        <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100">
          Creating Your Spiritual Welcome Package
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="space-y-3">
          <p className="text-purple-700 dark:text-purple-300">
            Our AI is analyzing your assessment responses to create personalized spiritual content just for you.
          </p>
          <div className="space-y-2">
            <Progress value={progress} className="w-full h-3" />
            <p className="text-sm text-purple-600 dark:text-purple-400">
              {progress < 30 && "Analyzing your spiritual gifts..."}
              {progress >= 30 && progress < 60 && "Creating personalized recommendations..."}
              {progress >= 60 && progress < 90 && "Generating your spiritual content..."}
              {progress >= 90 && "Almost ready..."}
            </p>
          </div>
        </div>

        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-purple-900 dark:text-purple-100">
            What we're creating for you:
          </h4>
          <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
            <li>• Personalized spiritual growth plan</li>
            <li>• Ministry opportunities that match your gifts</li>
            <li>• Curated devotional content</li>
            <li>• Prayer and Bible reading recommendations</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={onComplete}
            className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            Continue to Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}