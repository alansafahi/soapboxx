import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Heart, BookOpen, Brain, Users, Clock, Target, ArrowRight, ArrowLeft } from 'lucide-react';

export interface SelfIdentificationData {
  faithJourney: string;
  bibleFamiliarity: string;
  prayerLife: string;
  churchExperience: string;
  spiritualPractices: string[];
  lifeChallenges: string[];
  learningStyle: string[];
  timeAvailability: string;
  contentFocus: string[];
  prayerTypes: string[];
  deliveryTiming: string;
  difficultyLevel: string;
  currentChallenges: string;
  spiritualHopes: string;
  // Self-identification fields
  ministryInterests: string[];
  spiritualGifts: string[];
  leadershipExperience: string[];
  personalityTraits: string[];
}

interface SelfIdentificationAssessmentProps {
  onComplete: (data: SelfIdentificationData) => void;
  onBack?: () => void;
  userRole?: string;
}

export default function SelfIdentificationAssessment({ onComplete, onBack, userRole }: SelfIdentificationAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const [responses, setResponses] = useState<Partial<SelfIdentificationData>>({
    spiritualPractices: [],
    lifeChallenges: [],
    learningStyle: [],
    contentFocus: [],
    prayerTypes: [],
    ministryInterests: [],
    spiritualGifts: [],
    leadershipExperience: [],
    personalityTraits: []
  });

  const totalSteps = 8;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleMultiSelect = (field: keyof SelfIdentificationData, value: string) => {
    const currentValues = responses[field] as string[] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    setResponses(prev => ({
      ...prev,
      [field]: newValues
    }));
  };

  const handleSingleSelect = (field: keyof SelfIdentificationData, value: string) => {
    setResponses(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(responses as SelfIdentificationData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 0: return responses.faithJourney;
      case 1: return responses.bibleFamiliarity;
      case 2: return responses.prayerLife;
      case 3: return responses.spiritualPractices && responses.spiritualPractices.length > 0;
      case 4: return responses.ministryInterests && responses.ministryInterests.length > 0;
      case 5: return responses.spiritualGifts && responses.spiritualGifts.length > 0;
      case 6: return responses.timeAvailability;
      case 7: return true; // Final step with optional fields
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Heart className="w-12 h-12 text-purple-600 mx-auto" />
              <h3 className="text-xl font-semibold">Your Faith Journey</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Help us understand where you are in your relationship with God
              </p>
            </div>
            
            <RadioGroup 
              value={responses.faithJourney || ''} 
              onValueChange={(value) => handleSingleSelect('faithJourney', value)}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="seeking" id="seeking" />
                  <Label htmlFor="seeking" className="cursor-pointer flex-1">
                    <div className="font-medium">Seeking & Exploring</div>
                    <div className="text-sm text-gray-500">Curious about faith and wanting to learn more</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="new_believer" id="new_believer" />
                  <Label htmlFor="new_believer" className="cursor-pointer flex-1">
                    <div className="font-medium">New Believer</div>
                    <div className="text-sm text-gray-500">Recently started my faith journey</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="growing" id="growing" />
                  <Label htmlFor="growing" className="cursor-pointer flex-1">
                    <div className="font-medium">Growing in Faith</div>
                    <div className="text-sm text-gray-500">Learning and developing my relationship with God</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="mature" id="mature" />
                  <Label htmlFor="mature" className="cursor-pointer flex-1">
                    <div className="font-medium">Mature Believer</div>
                    <div className="text-sm text-gray-500">Established faith with deep understanding</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="leader" id="leader" />
                  <Label htmlFor="leader" className="cursor-pointer flex-1">
                    <div className="font-medium">Spiritual Leader</div>
                    <div className="text-sm text-gray-500">Teaching and mentoring others in their faith</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <BookOpen className="w-12 h-12 text-blue-600 mx-auto" />
              <h3 className="text-xl font-semibold">Bible Familiarity</h3>
              <p className="text-gray-600 dark:text-gray-300">
                How familiar are you with the Bible?
              </p>
            </div>
            
            <RadioGroup 
              value={responses.bibleFamiliarity || ''} 
              onValueChange={(value) => handleSingleSelect('bibleFamiliarity', value)}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="new" id="new" />
                  <Label htmlFor="new" className="cursor-pointer flex-1">
                    <div className="font-medium">New to the Bible</div>
                    <div className="text-sm text-gray-500">Just starting to explore Scripture</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="basic" id="basic" />
                  <Label htmlFor="basic" className="cursor-pointer flex-1">
                    <div className="font-medium">Basic Understanding</div>
                    <div className="text-sm text-gray-500">Know some stories and key verses</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate" className="cursor-pointer flex-1">
                    <div className="font-medium">Intermediate Knowledge</div>
                    <div className="text-sm text-gray-500">Regular reader with good understanding</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced" className="cursor-pointer flex-1">
                    <div className="font-medium">Advanced Study</div>
                    <div className="text-sm text-gray-500">Deep study and can teach others</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Heart className="w-12 h-12 text-pink-600 mx-auto" />
              <h3 className="text-xl font-semibold">Prayer Life</h3>
              <p className="text-gray-600 dark:text-gray-300">
                How would you describe your current prayer life?
              </p>
            </div>
            
            <RadioGroup 
              value={responses.prayerLife || ''} 
              onValueChange={(value) => handleSingleSelect('prayerLife', value)}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="beginning" id="beginning" />
                  <Label htmlFor="beginning" className="cursor-pointer flex-1">
                    <div className="font-medium">Just Beginning</div>
                    <div className="text-sm text-gray-500">Learning how to pray</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="occasional" id="occasional" />
                  <Label htmlFor="occasional" className="cursor-pointer flex-1">
                    <div className="font-medium">Occasional Prayer</div>
                    <div className="text-sm text-gray-500">Pray when needed or in difficult times</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="regular" id="regular" />
                  <Label htmlFor="regular" className="cursor-pointer flex-1">
                    <div className="font-medium">Regular Prayer</div>
                    <div className="text-sm text-gray-500">Daily prayer is part of my routine</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="devoted" id="devoted" />
                  <Label htmlFor="devoted" className="cursor-pointer flex-1">
                    <div className="font-medium">Devoted Prayer Life</div>
                    <div className="text-sm text-gray-500">Multiple times daily with extended periods</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Target className="w-12 h-12 text-green-600 mx-auto" />
              <h3 className="text-xl font-semibold">Spiritual Practices</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Which spiritual practices do you currently engage in? (Select all that apply)
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Daily Bible Reading", "Prayer & Meditation", "Church Attendance", "Small Group Participation",
                "Journaling", "Fasting", "Scripture Memorization", "Worship & Praise",
                "Service & Volunteering", "Tithing & Giving", "Fellowship & Community", "Spiritual Mentoring"
              ].map((practice) => (
                <div
                  key={practice}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    responses.spiritualPractices?.includes(practice)
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleMultiSelect('spiritualPractices', practice)}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={responses.spiritualPractices?.includes(practice) || false}
                    />
                    <span className="font-medium">{practice}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Users className="w-12 h-12 text-purple-600 mx-auto" />
              <h3 className="text-xl font-semibold">Ministry Interests</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Which ministry areas interest you? (Select all that apply)
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Youth Ministry", "Children's Ministry", "Worship & Music", "Teaching & Education",
                "Evangelism & Outreach", "Missions", "Prayer Ministry", "Pastoral Care",
                "Administration", "Media & Technology", "Community Service", "Small Groups",
                "Hospitality", "Counseling", "Leadership Development", "Special Events"
              ].map((interest) => (
                <div
                  key={interest}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    responses.ministryInterests?.includes(interest)
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleMultiSelect('ministryInterests', interest)}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={responses.ministryInterests?.includes(interest) || false}
                    />
                    <span className="font-medium">{interest}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Brain className="w-12 h-12 text-blue-600 mx-auto" />
              <h3 className="text-xl font-semibold">Spiritual Gifts Self-Assessment</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Which spiritual gifts do you believe you have or feel drawn to? (Select all that apply)
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Leadership", "Teaching", "Evangelism", "Prophecy",
                "Serving/Helps", "Giving", "Mercy", "Encouragement",
                "Pastor/Shepherd", "Faith", "Wisdom", "Knowledge",
                "Administration", "Hospitality", "Intercession", "Discernment"
              ].map((gift) => (
                <div
                  key={gift}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    responses.spiritualGifts?.includes(gift)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleMultiSelect('spiritualGifts', gift)}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={responses.spiritualGifts?.includes(gift) || false}
                    />
                    <span className="font-medium">{gift}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Clock className="w-12 h-12 text-orange-600 mx-auto" />
              <h3 className="text-xl font-semibold">Time Availability</h3>
              <p className="text-gray-600 dark:text-gray-300">
                How much time can you dedicate to spiritual growth activities?
              </p>
            </div>
            
            <RadioGroup 
              value={responses.timeAvailability || ''} 
              onValueChange={(value) => handleSingleSelect('timeAvailability', value)}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="5_minutes" id="5_minutes" />
                  <Label htmlFor="5_minutes" className="cursor-pointer flex-1">
                    <div className="font-medium">5 Minutes Daily</div>
                    <div className="text-sm text-gray-500">Quick daily inspiration</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="15_minutes" id="15_minutes" />
                  <Label htmlFor="15_minutes" className="cursor-pointer flex-1">
                    <div className="font-medium">15 Minutes Daily</div>
                    <div className="text-sm text-gray-500">Short devotional reading</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="30_minutes" id="30_minutes" />
                  <Label htmlFor="30_minutes" className="cursor-pointer flex-1">
                    <div className="font-medium">30 Minutes Daily</div>
                    <div className="text-sm text-gray-500">Bible study and prayer time</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="1_hour" id="1_hour" />
                  <Label htmlFor="1_hour" className="cursor-pointer flex-1">
                    <div className="font-medium">1+ Hours Daily</div>
                    <div className="text-sm text-gray-500">Extended study and prayer</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Target className="w-12 h-12 text-indigo-600 mx-auto" />
              <h3 className="text-xl font-semibold">Share Your Heart (Optional)</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Help us understand your spiritual journey better
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="challenges">Current spiritual challenges or questions:</Label>
                <Textarea
                  id="challenges"
                  placeholder="What areas would you like help with in your spiritual growth?"
                  value={responses.currentChallenges || ''}
                  onChange={(e) => handleSingleSelect('currentChallenges', e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="hopes">Spiritual hopes and goals:</Label>
                <Textarea
                  id="hopes"
                  placeholder="What are you hoping to achieve in your spiritual journey?"
                  value={responses.spiritualHopes || ''}
                  onChange={(e) => handleSingleSelect('spiritualHopes', e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-2xl">Spiritual Profile Assessment</CardTitle>
              <CardDescription className="mt-2">
                Self-identification format for quick spiritual profiling and volunteer matching
              </CardDescription>
            </div>
            <div className="text-sm text-gray-500">
              {currentStep + 1} of {totalSteps}
            </div>
          </div>
          <Progress value={progress} className="w-full" />
          <div className="mt-3 text-xs text-muted-foreground text-center">
            8 sections • Approximately 5-10 minutes
          </div>
        </CardHeader>
        
        <CardContent>
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 0 ? 'Back' : 'Previous'}
            </Button>
            
            <Button
              onClick={nextStep}
              disabled={!isStepComplete()}
              className="flex items-center gap-2"
            >
              {currentStep === totalSteps - 1 ? 'Complete Assessment' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}