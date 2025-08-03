import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import SpiritualAssessment, { SpiritualAssessmentData } from './SpiritualAssessment';
import BaselineEMICheckIn from './BaselineEMICheckIn';
import WelcomeSpiritualContent from './WelcomeSpiritualContent';

interface OnboardingSpiritualFlowProps {
  onComplete: () => void;
  onBack?: () => void;
  userProfile: {
    firstName: string;
    lastName: string;
    role: string;
  };
  isRoleBasedMandatory?: boolean; // Added to indicate if assessment is mandatory for user role
}

export default function OnboardingSpiritualFlow({ onComplete, onBack, userProfile, isRoleBasedMandatory = false }: OnboardingSpiritualFlowProps) {
  const [currentStep, setCurrentStep] = useState<'assessment' | 'baseline' | 'welcome'>('assessment');
  const [assessmentData, setAssessmentData] = useState<SpiritualAssessmentData | null>(null);
  const [baselineData, setBaselineData] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation to save spiritual assessment data
  const saveSpiritualDataMutation = useMutation({
    mutationFn: async (data: { assessment: SpiritualAssessmentData; baseline: any }) => {
      return apiRequest('POST', '/api/users/spiritual-onboarding', {
        assessmentData: data.assessment,
        baselineEMIState: data.baseline,
        generateWelcomeContent: true
      });
    },
    onSuccess: () => {
      toast({
        title: "Spiritual Profile Created",
        description: "Your personalized spiritual journey has been set up successfully."
      });
      setCurrentStep('welcome');
      // Invalidate user queries to refresh profile data
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Setup Error",
        description: error.message || "Failed to save spiritual profile. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAssessmentComplete = (data: SpiritualAssessmentData) => {
    setAssessmentData(data);
    setCurrentStep('baseline');
  };

  const handleBaselineComplete = (data: any) => {
    setBaselineData(data);
    
    if (assessmentData) {
      saveSpiritualDataMutation.mutate({
        assessment: assessmentData,
        baseline: data
      });
    }
  };

  const handleWelcomeComplete = () => {
    onComplete();
  };

  const handleBackFromBaseline = () => {
    setCurrentStep('assessment');
  };

  const handleBackFromAssessment = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {currentStep === 'assessment' && (
        <SpiritualAssessment
          onComplete={handleAssessmentComplete}
          onBack={handleBackFromAssessment}
          userRole={userProfile.role}
          isFullAssessment={true} // Always full assessment for direct navigation
        />
      )}
      
      {currentStep === 'baseline' && (
        <BaselineEMICheckIn
          onComplete={handleBaselineComplete}
          onBack={handleBackFromBaseline}
        />
      )}
      
      {currentStep === 'welcome' && assessmentData && (
        <WelcomeSpiritualContent
          assessmentData={assessmentData}
          onComplete={handleWelcomeComplete}
        />
      )}
      
      {/* Loading overlay during save */}
      {saveSpiritualDataMutation.isPending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
              <span>Setting up your spiritual journey...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}