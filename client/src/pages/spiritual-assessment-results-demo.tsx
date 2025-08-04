import React from 'react';
import SpiritualAssessmentResults from '../components/SpiritualAssessmentResults';

// Demo data based on your actual database records
const demoAssessmentData = {
  assessmentData: {
    responses: [
      { questionId: 1, response: 4, section: 'leadership' },
      { questionId: 2, response: 3, section: 'teaching' },
      { questionId: 3, response: 5, section: 'encouragement' },
      { questionId: 4, response: 4, section: 'service' },
      { questionId: 5, response: 4, section: 'hospitality' }
    ],
    totalQuestions: 120,
    completedAt: new Date().toISOString()
  },
  spiritualMaturityLevel: 'beginner',
  spiritualGifts: ['encouragement', 'service', 'hospitality'],
  spiritualProfile: {
    dominantGifts: ['encouragement', 'service'],
    shadowGifts: ['hospitality', 'mercy'],
    maturityLevel: 'beginner',
    recommendedMinistries: ['welcoming team', 'community service', 'small group member'],
    growthAreas: ['Bible study', 'prayer life', 'fellowship']
  },
  welcomeContent: {
    welcomeMessage: "Welcome, Alan! Based on your spiritual assessment, you are beginning an exciting journey of faith. Your responses indicate a heart eager to grow and learn more about God.",
    scriptures: ["For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future. - Jeremiah 29:11"],
    recommendations: {
      devotionals: ["Faith Foundations for New Believers", "Daily Encouragement for Growing Christians"],
      bibleReading: "New Testament Reading Plan",
      prayer: "Daily prayer and gratitude practice",
      ministry: "Community service and welcoming new members"
    },
    nextSteps: ["Join a small group for fellowship", "Start with daily Bible reading for 10 minutes", "Connect with a spiritual mentor"],
    encouragement: "God has amazing plans for your spiritual growth, and this is just the beginning of your beautiful journey with Him!"
  }
};

export default function SpiritualAssessmentResultsDemo() {
  const handleContinue = () => {
    window.location.href = '/dashboard';
  };

  return (
    <SpiritualAssessmentResults
      assessmentData={demoAssessmentData.assessmentData}
      spiritualGifts={demoAssessmentData.spiritualGifts}
      spiritualProfile={demoAssessmentData.spiritualProfile}
      welcomeContent={demoAssessmentData.welcomeContent}
      spiritualMaturityLevel={demoAssessmentData.spiritualMaturityLevel}
      onContinue={handleContinue}
    />
  );
}