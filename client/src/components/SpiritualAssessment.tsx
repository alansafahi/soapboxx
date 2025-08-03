import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Heart, BookOpen, Brain, Users, Clock, Target, ArrowRight, ArrowLeft } from 'lucide-react';

export interface SpiritualAssessmentData {
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
}

interface SpiritualAssessmentProps {
  onComplete: (data: SpiritualAssessmentData) => void;
  onBack?: () => void;
}

export default function SpiritualAssessment({ onComplete, onBack }: SpiritualAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Partial<SpiritualAssessmentData>>({
    spiritualPractices: [],
    lifeChallenges: [],
    learningStyle: [],
    contentFocus: [],
    prayerTypes: []
  });

  const totalSteps = 8;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleMultiSelect = (field: keyof SpiritualAssessmentData, value: string) => {
    const currentValues = responses[field] as string[] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    setResponses(prev => ({
      ...prev,
      [field]: newValues
    }));
  };

  const handleSingleSelect = (field: keyof SpiritualAssessmentData, value: string) => {
    setResponses(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete assessment
      onComplete(responses as SpiritualAssessmentData);
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
      case 3: return responses.churchExperience;
      case 4: return responses.spiritualPractices && responses.spiritualPractices.length > 0;
      case 5: return responses.lifeChallenges && responses.lifeChallenges.length > 0;
      case 6: return responses.learningStyle && responses.learningStyle.length > 0;
      case 7: return responses.timeAvailability;
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
              </div>
            </RadioGroup>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <BookOpen className="w-12 h-12 text-purple-600 mx-auto" />
              <h3 className="text-xl font-semibold">Bible Familiarity</h3>
              <p className="text-gray-600 dark:text-gray-300">
                How comfortable are you with reading and understanding the Bible?
              </p>
            </div>
            
            <RadioGroup 
              value={responses.bibleFamiliarity || ''} 
              onValueChange={(value) => handleSingleSelect('bibleFamiliarity', value)}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="new_to_bible" id="new_to_bible" />
                  <Label htmlFor="new_to_bible" className="cursor-pointer flex-1">
                    <div className="font-medium">New to the Bible</div>
                    <div className="text-sm text-gray-500">Just starting to explore Scripture</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="some_experience" id="some_experience" />
                  <Label htmlFor="some_experience" className="cursor-pointer flex-1">
                    <div className="font-medium">Some Experience</div>
                    <div className="text-sm text-gray-500">Familiar with basic stories and teachings</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="regular_reader" id="regular_reader" />
                  <Label htmlFor="regular_reader" className="cursor-pointer flex-1">
                    <div className="font-medium">Regular Reader</div>
                    <div className="text-sm text-gray-500">Read the Bible regularly and understand most passages</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="deep_study" id="deep_study" />
                  <Label htmlFor="deep_study" className="cursor-pointer flex-1">
                    <div className="font-medium">Deep Study</div>
                    <div className="text-sm text-gray-500">Engage in theological study and cross-references</div>
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
              <Heart className="w-12 h-12 text-purple-600 mx-auto" />
              <h3 className="text-xl font-semibold">Prayer Life</h3>
              <p className="text-gray-600 dark:text-gray-300">
                How would you describe your current prayer practice?
              </p>
            </div>
            
            <RadioGroup 
              value={responses.prayerLife || ''} 
              onValueChange={(value) => handleSingleSelect('prayerLife', value)}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="learning" id="learning" />
                  <Label htmlFor="learning" className="cursor-pointer flex-1">
                    <div className="font-medium">Learning to Pray</div>
                    <div className="text-sm text-gray-500">New to prayer and want guidance</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="occasional" id="occasional" />
                  <Label htmlFor="occasional" className="cursor-pointer flex-1">
                    <div className="font-medium">Occasional Prayer</div>
                    <div className="text-sm text-gray-500">Pray when needed or moved to do so</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily" className="cursor-pointer flex-1">
                    <div className="font-medium">Daily Prayer</div>
                    <div className="text-sm text-gray-500">Established daily prayer routine</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="multiple_daily" id="multiple_daily" />
                  <Label htmlFor="multiple_daily" className="cursor-pointer flex-1">
                    <div className="font-medium">Multiple Times Daily</div>
                    <div className="text-sm text-gray-500">Regular prayer throughout the day</div>
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
              <Users className="w-12 h-12 text-purple-600 mx-auto" />
              <h3 className="text-xl font-semibold">Church Experience</h3>
              <p className="text-gray-600 dark:text-gray-300">
                How long have you been part of a faith community?
              </p>
            </div>
            
            <RadioGroup 
              value={responses.churchExperience || ''} 
              onValueChange={(value) => handleSingleSelect('churchExperience', value)}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="new_to_church" id="new_to_church" />
                  <Label htmlFor="new_to_church" className="cursor-pointer flex-1">
                    <div className="font-medium">New to Church</div>
                    <div className="text-sm text-gray-500">Recently started attending or exploring</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="growing_involvement" id="growing_involvement" />
                  <Label htmlFor="growing_involvement" className="cursor-pointer flex-1">
                    <div className="font-medium">Growing Involvement</div>
                    <div className="text-sm text-gray-500">Becoming more active in church life</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="established_member" id="established_member" />
                  <Label htmlFor="established_member" className="cursor-pointer flex-1">
                    <div className="font-medium">Established Member</div>
                    <div className="text-sm text-gray-500">Active participant for several years</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="leadership_role" id="leadership_role" />
                  <Label htmlFor="leadership_role" className="cursor-pointer flex-1">
                    <div className="font-medium">Leadership Role</div>
                    <div className="text-sm text-gray-500">Serve in ministry or leadership capacity</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Target className="w-12 h-12 text-purple-600 mx-auto" />
              <h3 className="text-xl font-semibold">Spiritual Practices</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Which spiritual practices interest you most? (Select all that apply)
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: 'prayer', label: 'Prayer & Meditation', desc: 'Personal communion with God' },
                { id: 'bible_study', label: 'Bible Study', desc: 'Deep exploration of Scripture' },
                { id: 'worship', label: 'Worship & Praise', desc: 'Musical and expressive worship' },
                { id: 'service', label: 'Service & Ministry', desc: 'Serving others and community' },
                { id: 'fellowship', label: 'Fellowship', desc: 'Community and relationships' },
                { id: 'evangelism', label: 'Evangelism', desc: 'Sharing faith with others' },
                { id: 'fasting', label: 'Fasting', desc: 'Spiritual discipline and focus' },
                { id: 'journaling', label: 'Spiritual Journaling', desc: 'Reflecting and recording insights' }
              ].map((practice) => (
                <div
                  key={practice.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    responses.spiritualPractices?.includes(practice.id)
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleMultiSelect('spiritualPractices', practice.id)}
                >
                  <div className="font-medium">{practice.label}</div>
                  <div className="text-sm text-gray-500">{practice.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Brain className="w-12 h-12 text-purple-600 mx-auto" />
              <h3 className="text-xl font-semibold">Areas for Growth</h3>
              <p className="text-gray-600 dark:text-gray-300">
                What areas would you like spiritual support with? (Select all that apply)
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: 'anxiety', label: 'Anxiety & Worry', desc: 'Finding peace in troubled times' },
                { id: 'relationships', label: 'Relationships', desc: 'Building healthy connections' },
                { id: 'purpose', label: 'Life Purpose', desc: 'Understanding God\'s calling' },
                { id: 'growth', label: 'Spiritual Growth', desc: 'Deepening faith and maturity' },
                { id: 'healing', label: 'Healing & Recovery', desc: 'Overcoming pain and trauma' },
                { id: 'forgiveness', label: 'Forgiveness', desc: 'Learning to forgive and be forgiven' },
                { id: 'guidance', label: 'Decision Making', desc: 'Seeking wisdom for choices' },
                { id: 'hope', label: 'Hope & Encouragement', desc: 'Finding strength in difficult seasons' }
              ].map((challenge) => (
                <div
                  key={challenge.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    responses.lifeChallenges?.includes(challenge.id)
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleMultiSelect('lifeChallenges', challenge.id)}
                >
                  <div className="font-medium">{challenge.label}</div>
                  <div className="text-sm text-gray-500">{challenge.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <BookOpen className="w-12 h-12 text-purple-600 mx-auto" />
              <h3 className="text-xl font-semibold">Learning Preferences</h3>
              <p className="text-gray-600 dark:text-gray-300">
                How do you prefer to receive spiritual content? (Select all that apply)
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: 'short_verses', label: 'Short Bible Verses', desc: 'Daily inspirational verses' },
                { id: 'devotionals', label: 'Devotional Readings', desc: 'Reflective spiritual content' },
                { id: 'audio', label: 'Audio Content', desc: 'Podcasts and narrated content' },
                { id: 'video', label: 'Video Content', desc: 'Visual teachings and sermons' },
                { id: 'discussion', label: 'Discussion Groups', desc: 'Interactive learning with others' },
                { id: 'study_guides', label: 'Study Guides', desc: 'Structured learning materials' },
                { id: 'prayer_prompts', label: 'Prayer Prompts', desc: 'Guided prayer suggestions' },
                { id: 'practical_tips', label: 'Practical Applications', desc: 'Real-life faith applications' }
              ].map((style) => (
                <div
                  key={style.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    responses.learningStyle?.includes(style.id)
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleMultiSelect('learningStyle', style.id)}
                >
                  <div className="font-medium">{style.label}</div>
                  <div className="text-sm text-gray-500">{style.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Clock className="w-12 h-12 text-purple-600 mx-auto" />
              <h3 className="text-xl font-semibold">Time for Spiritual Growth</h3>
              <p className="text-gray-600 dark:text-gray-300">
                How much time can you dedicate to spiritual growth daily?
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
                    <div className="font-medium">5 Minutes</div>
                    <div className="text-sm text-gray-500">Quick daily inspiration</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="15_minutes" id="15_minutes" />
                  <Label htmlFor="15_minutes" className="cursor-pointer flex-1">
                    <div className="font-medium">15 Minutes</div>
                    <div className="text-sm text-gray-500">Short devotional reading</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="30_minutes" id="30_minutes" />
                  <Label htmlFor="30_minutes" className="cursor-pointer flex-1">
                    <div className="font-medium">30 Minutes</div>
                    <div className="text-sm text-gray-500">Bible study and prayer time</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="1_hour_plus" id="1_hour_plus" />
                  <Label htmlFor="1_hour_plus" className="cursor-pointer flex-1">
                    <div className="font-medium">1+ Hours</div>
                    <div className="text-sm text-gray-500">Deep study and extended prayer</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>

            <div className="space-y-4 pt-4 border-t">
              <Label htmlFor="challenges" className="text-base font-medium">
                What's currently on your heart? (Optional)
              </Label>
              <Textarea
                id="challenges"
                placeholder="Share any specific challenges, prayer requests, or hopes you have for your spiritual journey..."
                value={responses.currentChallenges || ''}
                onChange={(e) => handleSingleSelect('currentChallenges', e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="hopes" className="text-base font-medium">
                What do you hope to gain from this community? (Optional)
              </Label>
              <Textarea
                id="hopes"
                placeholder="Connection, growth, support, learning opportunities..."
                value={responses.spiritualHopes || ''}
                onChange={(e) => handleSingleSelect('spiritualHopes', e.target.value)}
                className="min-h-[60px]"
              />
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
            <CardTitle className="text-2xl">Spiritual Assessment</CardTitle>
            <div className="text-sm text-gray-500">
              {currentStep + 1} of {totalSteps}
            </div>
          </div>
          <Progress value={progress} className="w-full" />
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