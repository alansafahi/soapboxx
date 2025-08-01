import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Users, BookOpen, Compass, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OnboardingFlowProps {
  inviteToken?: string;
  inviterName?: string;
  churchName?: string;
  prefilledData?: {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
  };
  onComplete: (userData: any) => void;
}

const ROLES = [
  { id: 'member', label: "I'm a member", icon: Heart, description: "Join our community and grow in faith" },
  { id: 'volunteer', label: "I'm a volunteer", icon: Users, description: "Serve and make a difference" },
  { id: 'leader', label: "I'm a church leader", icon: BookOpen, description: "Lead and guide others" },
  { id: 'exploring', label: "I'm exploring", icon: Compass, description: "Learning about faith and community" }
];

const SPIRITUAL_STAGES = [
  'Exploring Faith',
  'New Believer', 
  'Active Disciple',
  'Leader',
  'Elder'
];

const MINISTRY_INTERESTS = [
  'Youth Ministry',
  'Worship & Music',
  'Outreach & Missions',
  'Media & Technology',
  'Teaching & Education',
  'Prayer Ministry',
  'Children\'s Ministry',
  'Small Groups',
  'Community Service',
  'Pastoral Care'
];

const AGE_RANGES = [
  '18-24',
  '25-34', 
  '35-44',
  '45-54',
  '55-64',
  '65+'
];

export default function OnboardingFlow({ inviteToken, inviterName, churchName, prefilledData, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Step 1: Account Creation
    firstName: prefilledData?.firstName || '',
    lastName: prefilledData?.lastName || '',
    email: prefilledData?.email || '',
    password: '',
    mobileNumber: prefilledData?.mobileNumber || '',
    agreeToTerms: false,
    
    // Step 2: Role Selection
    role: '',
    
    // Step 3: Spiritual Profile (Optional)
    gender: '',
    ageRange: '',
    spiritualStage: '',
    ministryInterests: [] as string[],
    churchAffiliation: churchName || '',
    
    // Metadata
    inviteToken: inviteToken || '',
    inviterName: inviterName || ''
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleMinistryInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      ministryInterests: prev.ministryInterests.includes(interest)
        ? prev.ministryInterests.filter(i => i !== interest)
        : [...prev.ministryInterests, interest]
    }));
  };

  const getStepProgress = () => (currentStep / 4) * 100;

  const canProceedFromStep1 = () => {
    return formData.firstName && formData.lastName && formData.email && 
           formData.password && formData.agreeToTerms;
  };

  const canProceedFromStep2 = () => {
    return formData.role;
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await onComplete(formData);
      toast({
        title: "Welcome to SoapBox!",
        description: "Your account has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Setup Error",
        description: "There was an issue completing your setup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4].map(step => (
          <div key={step} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-medium
              ${step <= currentStep 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-500'
              }
            `}>
              {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
            </div>
            {step < 4 && <div className={`w-8 h-0.5 ml-2 ${step < currentStep ? 'bg-purple-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Your Account
        </CardTitle>
        {inviterName && (
          <p className="text-muted-foreground">
            {inviterName} invited you to join {churchName || 'our faith community'}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData('firstName', e.target.value)}
              placeholder="John"
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData('lastName', e.target.value)}
              placeholder="Smith"
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            placeholder="john@example.com"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            placeholder="Choose a secure password"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="mobileNumber">Mobile Number (Optional)</Label>
          <Input
            id="mobileNumber"
            type="tel"
            value={formData.mobileNumber}
            onChange={(e) => updateFormData('mobileNumber', e.target.value)}
            placeholder="For prayer requests and notifications"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="agreeToTerms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => updateFormData('agreeToTerms', checked)}
          />
          <Label htmlFor="agreeToTerms" className="text-sm">
            I agree to the{' '}
            <a 
              href="https://soapboxsuperapp.com/terms-of-service" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-800 underline"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a 
              href="https://soapboxsuperapp.com/privacy-policy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-800 underline"
            >
              Privacy Policy
            </a> *
          </Label>
        </div>
        
        <Button 
          onClick={handleNext} 
          disabled={!canProceedFromStep1()}
          className="w-full"
        >
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          How do you see yourself?
        </CardTitle>
        <p className="text-muted-foreground">
          This helps us personalize your experience
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROLES.map(role => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${formData.role === role.id 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => updateFormData('role', role.id)}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-6 h-6 ${formData.role === role.id ? 'text-purple-600' : 'text-gray-500'}`} />
                  <div>
                    <p className="font-medium">{role.label}</p>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex space-x-4">
          <Button variant="outline" onClick={handleBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={!canProceedFromStep2()}
            className="flex-1"
          >
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Tell us about your faith journey
        </CardTitle>
        <p className="text-muted-foreground">
          Help us serve you better. You can skip or edit this anytime.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gender">Gender (Optional)</Label>
            <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="ageRange">Age Range</Label>
            <Select value={formData.ageRange} onValueChange={(value) => updateFormData('ageRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select age range" />
              </SelectTrigger>
              <SelectContent>
                {AGE_RANGES.map(range => (
                  <SelectItem key={range} value={range}>{range}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="spiritualStage">Spiritual Stage</Label>
          <Select value={formData.spiritualStage} onValueChange={(value) => updateFormData('spiritualStage', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Where are you in your faith journey?" />
            </SelectTrigger>
            <SelectContent>
              {SPIRITUAL_STAGES.map(stage => (
                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Ministry Interests (Select all that apply)</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {MINISTRY_INTERESTS.map(interest => (
              <Badge
                key={interest}
                variant={formData.ministryInterests.includes(interest) ? "default" : "outline"}
                className="cursor-pointer justify-start p-2"
                onClick={() => toggleMinistryInterest(interest)}
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>
        
        {churchName && (
          <div>
            <Label htmlFor="churchAffiliation">Church Affiliation</Label>
            <Input
              id="churchAffiliation"
              value={formData.churchAffiliation}
              onChange={(e) => updateFormData('churchAffiliation', e.target.value)}
              placeholder="Your church or community"
            />
          </div>
        )}
        
        <div className="flex space-x-4">
          <Button variant="outline" onClick={handleBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button variant="outline" onClick={handleNext} className="flex-1">
            Skip for now
          </Button>
          <Button onClick={handleNext} className="flex-1">
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome to SoapBox!
        </CardTitle>
        <p className="text-muted-foreground">
          You're all set to begin your spiritual journey with us
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          {churchName && (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p className="font-medium">You've joined {churchName}</p>
              <p className="text-sm text-muted-foreground">
                {inviterName && `Invited by ${inviterName}`}
              </p>
            </div>
          )}
          
          <div className="text-left space-y-2">
            <h3 className="font-semibold">What's next:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Explore daily inspirations and Bible readings</li>
              <li>• Start your S.O.A.P. journaling journey</li>
              <li>• Connect with prayer circles and community</li>
              <li>• Discover volunteer opportunities</li>
            </ul>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <Button variant="outline" onClick={handleBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button 
            onClick={handleComplete} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Setting up..." : "Let's get started!"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-8">
          <Progress value={getStepProgress()} className="w-full" />
        </div>
        
        {renderStepIndicator()}
        
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>
    </div>
  );
}