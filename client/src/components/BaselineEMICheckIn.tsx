import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Heart, ArrowRight, ArrowLeft } from 'lucide-react';

interface BaselineEMIData {
  selectedMoods: string[];
  personalReflection: string;
  communityHopes: string;
  prayerRequest: string;
  shareWithStaff: boolean;
}

interface BaselineEMICheckInProps {
  onComplete: (data: BaselineEMIData) => void;
  onBack?: () => void;
}

export default function BaselineEMICheckIn({ onComplete, onBack }: BaselineEMICheckInProps) {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [personalReflection, setPersonalReflection] = useState('');
  const [communityHopes, setCommunityHopes] = useState('');
  const [prayerRequest, setPrayerRequest] = useState('');
  const [shareWithStaff, setShareWithStaff] = useState(false);

  const spiritualMoods = [
    { id: 'blessed', emoji: '✨', label: 'Blessed', category: 'Spiritual States' },
    { id: 'peaceful', emoji: '😌', label: 'Peaceful', category: 'Spiritual States' },
    { id: 'grateful', emoji: '🙏', label: 'Grateful', category: 'Spiritual States' },
    { id: 'hopeful', emoji: '🌅', label: 'Hopeful', category: 'Spiritual States' },
    { id: 'faithful', emoji: '💎', label: 'Faithful', category: 'Spiritual States' },
    { id: 'growing', emoji: '🌱', label: 'Growing', category: 'Spiritual States' },
    { id: 'seeking', emoji: '🔍', label: 'Seeking', category: 'Spiritual States' },
    { id: 'struggling', emoji: '💔', label: 'Struggling', category: 'Emotional Well-being' },
    { id: 'anxious', emoji: '😰', label: 'Anxious', category: 'Emotional Well-being' },
    { id: 'uncertain', emoji: '🤔', label: 'Uncertain', category: 'Emotional Well-being' },
    { id: 'tired', emoji: '😴', label: 'Tired', category: 'Emotional Well-being' },
    { id: 'excited', emoji: '🎉', label: 'Excited', category: 'Life Circumstances' },
    { id: 'celebrating', emoji: '🎊', label: 'Celebrating', category: 'Life Circumstances' },
    { id: 'overwhelmed', emoji: '😵', label: 'Overwhelmed', category: 'Life Circumstances' },
    { id: 'transitioning', emoji: '🌀', label: 'In Transition', category: 'Life Circumstances' }
  ];

  const groupedMoods = spiritualMoods.reduce((acc, mood) => {
    if (!acc[mood.category]) {
      acc[mood.category] = [];
    }
    acc[mood.category].push(mood);
    return acc;
  }, {} as Record<string, typeof spiritualMoods>);

  const toggleMood = (moodId: string) => {
    setSelectedMoods(prev => 
      prev.includes(moodId) 
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId]
    );
  };

  const handleSubmit = () => {
    onComplete({
      selectedMoods,
      personalReflection,
      communityHopes,
      prayerRequest,
      shareWithStaff
    });
  };

  const isComplete = selectedMoods.length > 0;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="text-center space-y-2">
            <Heart className="w-12 h-12 text-purple-600 mx-auto" />
            <CardTitle className="text-2xl">How Are You Feeling Today?</CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Let's establish a baseline for your spiritual and emotional state as you begin this journey
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Mood Selection */}
          <div className="space-y-6">
            {Object.entries(groupedMoods).map(([category, moods]) => (
              <div key={category}>
                <h3 className="font-medium text-lg mb-3 text-gray-700 dark:text-gray-300">
                  {category}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {moods.map((mood) => (
                    <div
                      key={mood.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                        selectedMoods.includes(mood.id)
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                      }`}
                      onClick={() => toggleMood(mood.id)}
                    >
                      <div className="text-center space-y-1">
                        <div className="text-2xl">{mood.emoji}</div>
                        <div className="text-sm font-medium">{mood.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Moods Summary */}
          {selectedMoods.length > 0 && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-medium mb-2">Your Current State:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedMoods.map(moodId => {
                  const mood = spiritualMoods.find(m => m.id === moodId);
                  return mood ? (
                    <Badge key={moodId} variant="secondary" className="flex items-center gap-1">
                      <span>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Personal Reflection */}
          <div className="space-y-3">
            <Label htmlFor="reflection" className="text-base font-medium">
              What's on your heart today? (Optional)
            </Label>
            <Textarea
              id="reflection"
              placeholder="Share what's happening in your life, any thoughts or feelings you'd like to express..."
              value={personalReflection}
              onChange={(e) => setPersonalReflection(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Community Hopes */}
          <div className="space-y-3">
            <Label htmlFor="hopes" className="text-base font-medium">
              What do you hope to gain from this community? (Optional)
            </Label>
            <Textarea
              id="hopes"
              placeholder="Connection, spiritual growth, support, learning opportunities, service..."
              value={communityHopes}
              onChange={(e) => setCommunityHopes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Prayer Request */}
          <div className="space-y-3">
            <Label htmlFor="prayer" className="text-base font-medium">
              Any prayer requests to start your journey? (Optional)
            </Label>
            <Textarea
              id="prayer"
              placeholder="Share any prayer requests or areas where you'd like spiritual support..."
              value={prayerRequest}
              onChange={(e) => setPrayerRequest(e.target.value)}
              className="min-h-[80px]"
            />
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="share-staff"
                checked={shareWithStaff}
                onCheckedChange={(checked) => setShareWithStaff(checked as boolean)}
              />
              <Label htmlFor="share-staff" className="text-sm">
                Share with church staff for prayer support
              </Label>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={!isComplete}
              className="flex items-center gap-2"
            >
              Complete Setup
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}