import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heart, BookOpen, Users, HandHeart, Smile, Sparkles, Plus, X, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeeklyCheckinForm {
  spiritualGrowth: number;
  prayerLife: number;
  bibleReading: number;
  communityConnection: number;
  serviceOpportunities: number;
  emotionalWellbeing: number;
  gratitude: string[];
  struggles: string[];
  prayerRequests: string[];
  goals: string[];
  reflectionNotes: string;
}

const SCALE_LABELS = {
  1: 'Struggling',
  2: 'Needs Growth', 
  3: 'Steady',
  4: 'Growing',
  5: 'Thriving'
};

const GROWTH_AREAS = [
  {
    key: 'spiritualGrowth',
    title: 'Spiritual Growth',
    description: 'How connected do you feel to God this week?',
    icon: Sparkles,
    color: 'text-purple-600'
  },
  {
    key: 'prayerLife',
    title: 'Prayer Life',
    description: 'How consistent and meaningful has your prayer time been?',
    icon: Heart,
    color: 'text-pink-600'
  },
  {
    key: 'bibleReading',
    title: 'Bible Reading',
    description: 'How engaged have you been with Scripture?',
    icon: BookOpen,
    color: 'text-blue-600'
  },
  {
    key: 'communityConnection',
    title: 'Community Connection',
    description: 'How connected do you feel to your faith community?',
    icon: Users,
    color: 'text-green-600'
  },
  {
    key: 'serviceOpportunities',
    title: 'Service & Ministry',
    description: 'How actively have you served others this week?',
    icon: HandHeart,
    color: 'text-orange-600'
  },
  {
    key: 'emotionalWellbeing',
    title: 'Emotional Wellbeing',
    description: 'How have you been feeling emotionally and mentally?',
    icon: Smile,
    color: 'text-yellow-600'
  }
];

export function WeeklyCheckin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState<WeeklyCheckinForm>({
    spiritualGrowth: 3,
    prayerLife: 3,
    bibleReading: 3,
    communityConnection: 3,
    serviceOpportunities: 3,
    emotionalWellbeing: 3,
    gratitude: [''],
    struggles: [''],
    prayerRequests: [''],
    goals: [''],
    reflectionNotes: ''
  });

  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;

  const { data: hasCompleted } = useQuery({
    queryKey: ['/api/weekly-checkin/status'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/weekly-checkin/stats'],
  });

  const submitMutation = useMutation({
    mutationFn: async (checkinData: WeeklyCheckinForm) => {
      const response = await fetch('/api/weekly-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkinData),
      });
      if (!response.ok) throw new Error('Failed to submit check-in');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/weekly-checkin/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/weekly-checkin/stats'] });
      toast({
        title: "Check-in Complete! 🎉",
        description: "Thank you for reflecting on your spiritual journey. You earned 100 points!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit your check-in. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateSlider = (key: keyof WeeklyCheckinForm, value: number[]) => {
    setForm(prev => ({ ...prev, [key]: value[0] }));
  };

  const updateArray = (key: keyof WeeklyCheckinForm, index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (key: keyof WeeklyCheckinForm) => {
    if ((form[key] as string[]).length < 5) {
      setForm(prev => ({
        ...prev,
        [key]: [...(prev[key] as string[]), '']
      }));
    }
  };

  const removeArrayItem = (key: keyof WeeklyCheckinForm, index: number) => {
    if ((form[key] as string[]).length > 1) {
      setForm(prev => ({
        ...prev,
        [key]: (prev[key] as string[]).filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = () => {
    // Filter out empty strings from arrays
    const cleanedForm = {
      ...form,
      gratitude: form.gratitude.filter(item => item.trim()),
      struggles: form.struggles.filter(item => item.trim()),
      prayerRequests: form.prayerRequests.filter(item => item.trim()),
      goals: form.goals.filter(item => item.trim()),
    };
    
    submitMutation.mutate(cleanedForm);
  };

  if (hasCompleted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <CardTitle className="text-2xl text-green-700">Check-in Complete!</CardTitle>
          <CardDescription>
            You've already completed your weekly spiritual check-in. Thank you for staying connected to your faith journey!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {stats && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.streakCount}</div>
                <div className="text-sm text-gray-600">Week Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalCheckins}</div>
                <div className="text-sm text-gray-600">Total Check-ins</div>
              </div>
            </div>
          )}
          <p className="text-sm text-gray-600">Come back next week to continue your spiritual reflection journey!</p>
        </CardContent>
      </Card>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">How are you growing spiritually?</h3>
              <p className="text-gray-600">Rate each area on a scale of 1-5</p>
            </div>
            
            {GROWTH_AREAS.map((area) => {
              const IconComponent = area.icon;
              const value = form[area.key as keyof WeeklyCheckinForm] as number;
              
              return (
                <div key={area.key} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`w-5 h-5 ${area.color}`} />
                    <div>
                      <Label className="font-medium">{area.title}</Label>
                      <p className="text-sm text-gray-600">{area.description}</p>
                    </div>
                  </div>
                  
                  <div className="px-4">
                    <Slider
                      value={[value]}
                      onValueChange={(val) => updateSlider(area.key as keyof WeeklyCheckinForm, val)}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-500">Struggling</span>
                      <Badge variant="outline" className="text-xs">
                        {SCALE_LABELS[value as keyof typeof SCALE_LABELS]}
                      </Badge>
                      <span className="text-xs text-gray-500">Thriving</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
        
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">What are you grateful for?</h3>
              <p className="text-gray-600">List the blessings and positive moments from this week</p>
            </div>
            
            {form.gratitude.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder="I'm grateful for..."
                  value={item}
                  onChange={(e) => updateArray('gratitude', index, e.target.value)}
                />
                {form.gratitude.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem('gratitude', index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            
            {form.gratitude.length < 5 && (
              <Button
                variant="outline"
                onClick={() => addArrayItem('gratitude')}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Blessing
              </Button>
            )}
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Where do you need support?</h3>
              <p className="text-gray-600">Share your struggles and prayer requests</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="font-medium mb-2 block">Challenges & Struggles</Label>
                {form.struggles.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      placeholder="I'm struggling with..."
                      value={item}
                      onChange={(e) => updateArray('struggles', index, e.target.value)}
                    />
                    {form.struggles.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem('struggles', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {form.struggles.length < 5 && (
                  <Button
                    variant="outline"
                    onClick={() => addArrayItem('struggles')}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Challenge
                  </Button>
                )}
              </div>
              
              <Separator />
              
              <div>
                <Label className="font-medium mb-2 block">Prayer Requests</Label>
                {form.prayerRequests.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      placeholder="Please pray for..."
                      value={item}
                      onChange={(e) => updateArray('prayerRequests', index, e.target.value)}
                    />
                    {form.prayerRequests.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem('prayerRequests', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {form.prayerRequests.length < 5 && (
                  <Button
                    variant="outline"
                    onClick={() => addArrayItem('prayerRequests')}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Prayer Request
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Looking ahead</h3>
              <p className="text-gray-600">Set intentions and goals for the coming week</p>
            </div>
            
            <div>
              <Label className="font-medium mb-2 block">Goals for Next Week</Label>
              {form.goals.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <Input
                    placeholder="This week I want to..."
                    value={item}
                    onChange={(e) => updateArray('goals', index, e.target.value)}
                  />
                  {form.goals.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem('goals', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {form.goals.length < 5 && (
                <Button
                  variant="outline"
                  onClick={() => addArrayItem('goals')}
                  size="sm"
                  className="mb-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Goal
                </Button>
              )}
            </div>
            
            <div>
              <Label className="font-medium mb-2 block">Additional Reflections</Label>
              <Textarea
                placeholder="Any other thoughts, insights, or reflections from this week..."
                value={form.reflectionNotes}
                onChange={(e) => setForm(prev => ({ ...prev, reflectionNotes: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-2xl">Weekly Spiritual Check-in</CardTitle>
          <Badge variant="outline">
            Step {currentStep + 1} of {totalSteps}
          </Badge>
        </div>
        <CardDescription>
          Take a moment to reflect on your spiritual journey this week
        </CardDescription>
        <Progress value={((currentStep + 1) / totalSteps) * 100} className="mt-4" />
      </CardHeader>
      
      <CardContent>
        {renderStep()}
        
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          {currentStep < totalSteps - 1 ? (
            <Button
              onClick={() => setCurrentStep(prev => Math.min(totalSteps - 1, prev + 1))}
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {submitMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Check-in</span>
                </div>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default WeeklyCheckin;