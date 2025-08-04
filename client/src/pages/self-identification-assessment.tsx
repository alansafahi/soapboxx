import { useState } from 'react';
import { useLocation } from 'wouter';
import SelfIdentificationAssessment, { SelfIdentificationData } from '../components/SelfIdentificationAssessment';
import OnboardingSpiritualFlow from '../components/OnboardingSpiritualFlow';

export default function SelfIdentificationAssessmentPage() {
  const [, setLocation] = useLocation();
  const [showFlow, setShowFlow] = useState(false);

  const handleAssessmentComplete = (data: SelfIdentificationData) => {
    
    // Here you would typically save the assessment data
    // For now, show the spiritual flow
    setShowFlow(true);
  };

  const handleFlowComplete = () => {
    // Navigate back to profile or dashboard
    setLocation('/profile');
  };

  const handleBack = () => {
    setLocation('/profile');
  };

  if (showFlow) {
    return (
      <OnboardingSpiritualFlow 
        onComplete={handleFlowComplete}
        onBack={() => setShowFlow(false)}
        userProfile={{} as any}
      />
    );
  }

  return (
    <SelfIdentificationAssessment 
      onComplete={handleAssessmentComplete}
      onBack={handleBack}
    />
  );
}