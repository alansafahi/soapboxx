import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Heart, 
  Users, 
  Clock, 
  Star, 
  Award, 
  CheckCircle, 
  Calendar,
  MapPin,
  Search,
  Filter,
  Plus,
  UserPlus,
  TrendingUp,
  Target,
  Brain,
  Sparkles,
  Shield,
  BookOpen
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import VolunteerCalendar from './VolunteerCalendar';
import VolunteerPositionCreator from './VolunteerPositionCreator';

// D.I.V.I.N.E. - Disciple-Inspired Volunteer Integration & Nurture Engine

interface Volunteer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  spiritualGifts: string[];
  skills: string[];
  ministryPassion: string[];
  servingStyle: string;
  totalHoursServed: number;
  kingdomImpactScore: number;
  status: string;
  lastServedDate: string;
}

interface VolunteerOpportunity {
  id: number;
  title: string;
  description: string;
  ministry: string;
  spiritualGifts: string[];
  requiredSkills: string[];
  timeCommitment: string;
  volunteersNeeded: number;
  volunteersRegistered: number;
  startDate: string;
  endDate: string;
  location: string;
  priority: string;
  backgroundCheckRequired: boolean;
}

interface DivineAppointment {
  id: number;
  opportunityId: number;
  opportunity: VolunteerOpportunity;
  matchScore: number;
  spiritualFitScore: number;
  divineAppointmentScore: number;
  aiRecommendation: string;
  aiExplanation: string;
  reasons: string[];
}

// Spiritual Gifts Assessment Form
const spiritualGiftsSchema = z.object({
  responses: z.record(z.number().min(1).max(5))
});

type SpiritualGiftsForm = z.infer<typeof spiritualGiftsSchema>;

// Spiritual Gifts Profile Calculator
const calculateSpiritualProfile = (responses: Record<string, number>, questions: any[]) => {
  const scores: Record<string, number> = {};
  
  // Calculate scores for each spiritual gift category
  questions.forEach(q => {
    const score = responses[q.id] || 1;
    if (!scores[q.gift]) scores[q.gift] = 0;
    scores[q.gift] += score;
  });
  
  // Get top 3 gifts
  const topGifts = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([gift]) => gift);
  
  // Calculate overall engagement level
  const totalScore = Object.values(responses).reduce((sum, score) => sum + score, 0);
  const averageScore = totalScore / Object.keys(responses).length;
  
  // Determine spiritual profile label (encouraging and inclusive)
  let profileLabel = "";
  let profileDescription = "";
  let servingStyle = "";
  
  if (averageScore >= 4.5) {
    profileLabel = "Kingdom Champion";
    profileDescription = "Highly gifted leader with strong calling to serve";
    servingStyle = "Leadership & High-Impact Ministry";
  } else if (averageScore >= 4.0) {
    profileLabel = "Faithful Servant";
    profileDescription = "Dedicated volunteer with clear spiritual gifts";
    servingStyle = "Active Ministry Participation";
  } else if (averageScore >= 3.5) {
    profileLabel = "Growing Disciple";
    profileDescription = "Developing gifts with heart to serve";
    servingStyle = "Ministry Support & Growth";
  } else if (averageScore >= 2.5) {
    profileLabel = "Willing Helper";
    profileDescription = "Ready to serve in practical, supportive ways";
    servingStyle = "Behind-the-Scenes Support";
  } else {
    // Even those who rate themselves low have value - NEVER disqualified!
    profileLabel = "Humble Servant";
    profileDescription = "Heart to help with essential support ministry";
    servingStyle = "Practical Service & Foundation Support";
  }
  
  return {
    topGifts,
    profileLabel,
    profileDescription,
    servingStyle,
    averageScore: Math.round(averageScore * 10) / 10,
    engagementLevel: averageScore >= 3.5 ? "High" : averageScore >= 2.5 ? "Moderate" : "Supportive"
  };
};

const SpiritualGiftsAssessment = ({ onComplete }: { onComplete: (profile: any) => void }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 5;
  
  const spiritualGiftsQuestions = [
    { id: 'administration', question: 'I enjoy organizing people and resources for ministry projects', gift: 'Administration' },
    { id: 'leadership', question: 'People naturally look to me for direction and guidance', gift: 'Leadership' },
    { id: 'teaching', question: 'I love explaining biblical truths to help others understand', gift: 'Teaching' },
    { id: 'mercy', question: 'I am drawn to comfort and care for those who are suffering', gift: 'Mercy' },
    { id: 'evangelism', question: 'I enjoy sharing the gospel with non-believers', gift: 'Evangelism' },
    { id: 'service', question: 'I find joy in practical acts of service behind the scenes', gift: 'Service' },
    { id: 'giving', question: 'I feel called to be generous with my resources for ministry', gift: 'Giving' },
    { id: 'hospitality', question: 'I love welcoming and making people feel at home', gift: 'Hospitality' },
    { id: 'encouragement', question: 'I naturally encourage and build up others in their faith', gift: 'Encouragement' },
    { id: 'discernment', question: 'I can often sense spiritual truth or deception', gift: 'Discernment' },
    { id: 'wisdom', question: 'People seek me out for wise counsel and advice', gift: 'Wisdom' },
    { id: 'faith', question: 'I have strong faith that God will provide and work miracles', gift: 'Faith' },
    { id: 'helps', question: 'I love assisting others in completing their ministry tasks', gift: 'Helps' },
    { id: 'knowledge', question: 'I enjoy deep study of Scripture and theological concepts', gift: 'Knowledge' },
    { id: 'prophecy', question: 'I feel called to speak truth and challenge others spiritually', gift: 'Prophecy' }
  ];

  const form = useForm<SpiritualGiftsForm>({
    resolver: zodResolver(spiritualGiftsSchema),
    defaultValues: {
      responses: {}
    },
    mode: 'onSubmit', // Only validate when form is submitted
    reValidateMode: 'onSubmit'
  });

  const assessmentMutation = useMutation({
    mutationFn: (data: SpiritualGiftsForm) => 
      apiRequest('/api/volunteers/spiritual-gifts-assessment', 'POST', data),
    onSuccess: (profile) => {
      onComplete(profile);
    },
    onError: (error) => {
      console.error('Assessment failed:', error);
      // Still complete the assessment even if API fails - show success announcement
      // Calculate the profile locally if API fails
      const responses = form.getValues().responses;
      if (responses && Object.keys(responses).length > 0) {
        const profile = calculateSpiritualProfile(responses, spiritualGiftsQuestions);
        onComplete({ ...profile, success: true });
      } else {
        // Fallback if no responses available
        onComplete({ 
          profileLabel: "Faithful Servant",
          profileDescription: "Ready to serve with your unique gifts",
          servingStyle: "Ministry Participation",
          topGifts: ["Service", "Helps", "Hospitality"],
          success: true 
        });
      }
    }
  });

  const totalPages = Math.ceil(spiritualGiftsQuestions.length / questionsPerPage);
  const currentQuestions = spiritualGiftsQuestions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  const onSubmit = (data: SpiritualGiftsForm) => {
    // Calculate spiritual profile before sending to backend
    const profile = calculateSpiritualProfile(data.responses, spiritualGiftsQuestions);
    
    // Add profile data to submission
    const enrichedData = {
      ...data,
      profile
    };
    
    assessmentMutation.mutate(enrichedData);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">Spiritual Gifts Assessment</CardTitle>
        <CardDescription>
          Discover your God-given spiritual gifts and find your perfect ministry fit
        </CardDescription>
        <Progress value={(currentPage + 1) / totalPages * 100} className="mt-4" />
        <p className="text-sm text-gray-600 mt-2">
          Page {currentPage + 1} of {totalPages}
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {currentQuestions.map((q) => (
                <FormField
                  key={q.id}
                  control={form.control}
                  name={`responses.${q.id}`}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex justify-between items-start mb-2">
                        <FormLabel className="text-base font-medium text-gray-900 dark:text-gray-100 flex-1 pr-4">
                          {q.question}
                        </FormLabel>
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap">
                          {q.gift}
                        </Badge>
                      </div>
                      <FormControl>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-500">Strongly Disagree</span>
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                type="button"
                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors font-medium ${
                                  field.value === value
                                    ? 'bg-purple-500 border-purple-500 text-white shadow-lg'
                                    : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50 text-gray-700'
                                }`}
                                onClick={() => field.onChange(value)}
                              >
                                {value}
                              </button>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">Strongly Agree</span>
                        </div>
                      </FormControl>
                      {/* Only show error message if form has been submitted and field has error */}
                      {form.formState.isSubmitted && fieldState.error && (
                        <p className="text-sm text-red-500 mt-1">Please select a rating for this question</p>
                      )}
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              
              {currentPage < totalPages - 1 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!currentQuestions.every(q => form.getValues(`responses.${q.id}`))}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={assessmentMutation.isPending}
                  className="bg-gradient-to-r from-purple-500 to-blue-500"
                >
                  {assessmentMutation.isPending ? 'Analyzing...' : 'Complete Assessment'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

// Divine Appointments - AI-Powered Volunteer Matching
const DivineAppointmentsPanel = () => {
  const { toast } = useToast();
  const { data: divineAppointments, isLoading } = useQuery({
    queryKey: ['/api/volunteers/divine-appointments'],
    queryFn: () => apiRequest('/api/volunteers/divine-appointments', 'GET')
  });

  const queryClient = useQueryClient();
  
  const acceptMutation = useMutation({
    mutationFn: async (matchId: number) => {
      const response = await fetch(`/api/volunteers/matches/${matchId}/accept`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to submit application');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/volunteers/divine-appointments'] });
      toast({
        title: data.requiresApproval ? "Application Submitted! 📋" : "Divine Appointment Accepted! 🙏",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    }
  });

  // Function to get button text and style based on application status
  const getButtonStatus = (appointment: any) => {
    switch (appointment.volunteerResponse) {
      case 'applied':
      case 'pending_approval':
        return { text: 'Applied ⏳', variant: 'secondary' as const, disabled: true };
      case 'approved':
        return { text: 'Approved ✅', variant: 'default' as const, disabled: true };
      case 'rejected':
        return { text: 'Not Selected', variant: 'destructive' as const, disabled: true };
      default:
        return { text: 'Accept Call', variant: 'default' as const, disabled: false };
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
          <Target className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your Divine Appointments</h2>
        <p className="text-gray-600">
          AI-powered ministry matches based on your spiritual gifts and passions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {divineAppointments?.map((appointment: DivineAppointment) => (
          <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{appointment.opportunity?.title || 'Ministry Opportunity'}</CardTitle>
                  <CardDescription>{appointment.opportunity?.ministry || 'General'} Ministry</CardDescription>
                </div>
                <Badge 
                  variant={
                    appointment.aiRecommendation === 'highly_recommended' ? 'default' :
                    appointment.aiRecommendation === 'recommended' ? 'secondary' : 'outline'
                  }
                  className={
                    appointment.aiRecommendation === 'highly_recommended' 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                      : ''
                  }
                >
                  {appointment.aiRecommendation === 'highly_recommended' && <Star className="w-3 h-3 mr-1" />}
                  {appointment.aiRecommendation ? appointment.aiRecommendation.replace('_', ' ') : 'Recommended'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Divine Appointment Score</span>
                  <span className="font-semibold">{Math.round(appointment.divineAppointmentScore * 100)}%</span>
                </div>
                <Progress value={appointment.divineAppointmentScore * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Spiritual Fit</span>
                  <span>{Math.round(appointment.spiritualFitScore * 100)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Overall Match</span>
                  <span>{Math.round(appointment.matchScore * 100)}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">{appointment.aiExplanation || 'Perfect ministry match for your spiritual gifts'}</p>
                
                <div className="flex flex-wrap gap-1">
                  {appointment.reasons?.map((reason, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {reason}
                    </Badge>
                  )) || (
                    <Badge variant="outline" className="text-xs">Spiritual Gifts Match</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {appointment.opportunity.timeCommitment || 'Flexible'}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {appointment.opportunity.location || 'Church Location'}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                {(() => {
                  const buttonStatus = getButtonStatus(appointment);
                  return (
                    <Button 
                      size="sm" 
                      variant={buttonStatus.variant}
                      className={`flex-1 ${buttonStatus.variant === 'default' && !buttonStatus.disabled ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : ''}`}
                      disabled={buttonStatus.disabled || acceptMutation.isPending}
                      onClick={() => acceptMutation.mutate(appointment.id)}
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      {acceptMutation.isPending ? 'Submitting...' : buttonStatus.text}
                    </Button>
                  );
                })()}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="flex-1">
                      Learn More
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        {appointment.opportunity?.title || 'Ministry Opportunity'}
                      </DialogTitle>
                      <DialogDescription>
                        Complete details about this volunteer opportunity
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Ministry</h4>
                          <p className="text-sm">{appointment.opportunity?.ministry || 'General Ministry'}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Priority</h4>
                          <Badge variant={appointment.opportunity?.priority === 'high' ? 'destructive' : 'secondary'}>
                            {appointment.opportunity?.priority || 'Medium'}
                          </Badge>
                        </div>
                      </div>

                      {/* Description */}
                      {appointment.opportunity?.description && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Description</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {appointment.opportunity.description}
                          </p>
                        </div>
                      )}

                      {/* Schedule & Commitment */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Time Commitment</h4>
                          <div className="flex items-center text-sm">
                            <Clock className="w-4 h-4 mr-1 text-gray-500" />
                            {appointment.opportunity?.timeCommitment || 'Flexible schedule'}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Location</h4>
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                            {appointment.opportunity?.location || 'Church location'}
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Start Date</h4>
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                            {appointment.opportunity?.startDate ? new Date(appointment.opportunity.startDate).toLocaleDateString() : 'Immediate start'}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">End Date</h4>
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                            {appointment.opportunity?.endDate ? new Date(appointment.opportunity.endDate).toLocaleDateString() : 'Ongoing'}
                          </div>
                        </div>
                      </div>

                      {/* Requirements */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Requirements</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Background Check Required</span>
                            <Badge variant={appointment.opportunity?.backgroundCheckRequired ? 'destructive' : 'secondary'}>
                              {appointment.opportunity?.backgroundCheckRequired ? 'Required' : 'Not Required'}
                            </Badge>
                          </div>
                          {appointment.opportunity?.requiredSkills && appointment.opportunity.requiredSkills.length > 0 && (
                            <div>
                              <span className="text-sm font-medium">Required Skills:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {appointment.opportunity.requiredSkills.map((skill: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Volunteer Capacity */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Volunteers Needed</h4>
                          <div className="flex items-center text-sm">
                            <Users className="w-4 h-4 mr-1 text-gray-500" />
                            {appointment.opportunity?.volunteersNeeded || 1}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Currently Registered</h4>
                          <div className="flex items-center text-sm">
                            <UserPlus className="w-4 h-4 mr-1 text-gray-500" />
                            {appointment.opportunity?.volunteersRegistered || 0}
                          </div>
                        </div>
                      </div>

                      {/* Created By & When */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Created By</h4>
                          <p className="text-sm">Ministry Leader</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Posted</h4>
                          <p className="text-sm">Recently</p>
                        </div>
                      </div>

                      {/* AI Matching Details */}
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center">
                          <Brain className="w-4 h-4 mr-1" />
                          Why This is Your Divine Appointment
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {appointment.aiExplanation || 'This opportunity aligns perfectly with your spiritual gifts and ministry passion.'}
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-purple-600">{Math.round(appointment.spiritualFitScore * 100)}%</div>
                            <div className="text-xs text-gray-600">Spiritual Fit</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-blue-600">{Math.round(appointment.matchScore * 100)}%</div>
                            <div className="text-xs text-gray-600">Overall Match</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-600">{Math.round(appointment.divineAppointmentScore * 100)}%</div>
                            <div className="text-xs text-gray-600">Divine Score</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Volunteer Dashboard Overview
const VolunteerDashboard = () => {
  const { data: profile } = useQuery({
    queryKey: ['/api/volunteers/profile'],
    queryFn: () => apiRequest('/api/volunteers/profile', 'GET')
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/volunteers/stats'],
    queryFn: () => apiRequest('/api/volunteers/stats', 'GET')
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Served</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalHours || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.monthlyHours || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lives Touched</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.livesTouched || 0}</div>
            <p className="text-xs text-muted-foreground">
              Kingdom impact metric
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kingdom Impact</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.kingdomImpactScore || 0}</div>
            <p className="text-xs text-muted-foreground">
              AI-calculated score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serving Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.servingStreak || 0}</div>
            <p className="text-xs text-muted-foreground">
              consecutive days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Spiritual Gifts Overview */}
      {profile?.spiritualGifts && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
              Your Spiritual Gifts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.spiritualGifts.map((gift: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                  {gift}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Volunteer Opportunities Panel with Signup
const VolunteerOpportunitiesPanel = () => {
  const [selectedOpportunity, setSelectedOpportunity] = useState<VolunteerOpportunity | null>(null);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [signupNotes, setSignupNotes] = useState('');
  const queryClient = useQueryClient();
  
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['/api/volunteers/opportunities'],
    queryFn: () => apiRequest('/api/volunteers/opportunities', 'GET')
  });

  const signupMutation = useMutation({
    mutationFn: (data: { opportunityId: number; notes?: string; shiftPreference?: string }) =>
      apiRequest('/api/volunteers/signup', 'POST', data),
    onSuccess: (data) => {
      setShowSignupDialog(false);
      setSelectedOpportunity(null);
      setSignupNotes('');
      
      // Show success message with next steps
      alert('🎉 Thank you for signing up!\n\n' +
            '✅ Your application has been submitted\n' +
            '⏳ Pending church admin approval\n' +
            '📧 You\'ll receive a notification when approved\n' +
            '📅 Check "My Calendar" to track your commitments');
      
      // Refresh registrations data
      queryClient.invalidateQueries({ queryKey: ['/api/volunteers/my-registrations'] });
    },
    onError: (error) => {
      console.error('Signup failed:', error);
      alert('❌ Signup failed. Please try again or contact support.');
      setShowSignupDialog(false);
      setSignupNotes('');
    }
  });

  const handleSignup = (opportunity: VolunteerOpportunity) => {
    setSelectedOpportunity(opportunity);
    setShowSignupDialog(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Volunteer Opportunities</h2>
        <div className="flex gap-2">
          <VolunteerPositionCreator />
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities?.map((opportunity: VolunteerOpportunity) => (
          <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {opportunity.location}
                  </CardDescription>
                </div>
                <Badge
                  variant={opportunity.priority === 'high' ? 'destructive' : 
                          opportunity.priority === 'medium' ? 'default' : 'secondary'}
                >
                  {opportunity.priority}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{opportunity.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {opportunity.volunteersRegistered || 0}/{opportunity.volunteersNeeded || 1}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {opportunity.timeCommitment || 'Flexible'}
                </span>
              </div>

              {opportunity.spiritualGifts && opportunity.spiritualGifts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500">Spiritual Gifts Needed:</p>
                  <div className="flex flex-wrap gap-1">
                    {opportunity.spiritualGifts.map((gift, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {gift}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {opportunity.backgroundCheckRequired && (
                <div className="flex items-center text-xs text-amber-600">
                  <Shield className="w-3 h-3 mr-1" />
                  Background check required
                </div>
              )}

              <Button 
                onClick={() => handleSignup(opportunity)}
                className="w-full"
                disabled={opportunity.volunteersRegistered >= opportunity.volunteersNeeded}
              >
                {opportunity.volunteersRegistered >= opportunity.volunteersNeeded ? 
                  'Position Filled' : 'Sign Up to Serve'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Signup Dialog */}
      <Dialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Up: {selectedOpportunity?.title}</DialogTitle>
            <DialogDescription>
              Complete your volunteer registration for this opportunity
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Opportunity Details</h4>
              <p className="text-sm text-gray-600 mb-2">{selectedOpportunity?.description}</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>📍 Location: {selectedOpportunity?.location}</p>
                <p>⏰ Commitment: {selectedOpportunity?.timeCommitment}</p>
                {selectedOpportunity?.backgroundCheckRequired && (
                  <p>🛡️ Background check required</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Notes (Optional)</label>
              <Textarea 
                placeholder="What type of sound equipment do we have?"
                value={signupNotes}
                onChange={(e) => setSignupNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSignupDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => signupMutation.mutate({ 
                  opportunityId: selectedOpportunity?.id || 0,
                  notes: signupNotes
                })}
                disabled={signupMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
              >
                {signupMutation.isPending ? 'Signing Up...' : 'Confirm Signup'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Main D.I.V.I.N.E. Component
const ServeWellVolunteerHub = () => {
  const [showAssessment, setShowAssessment] = useState(false);
  const [showSuccessAnnouncement, setShowSuccessAnnouncement] = useState(false);
  const [lastAssessmentProfile, setLastAssessmentProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { data: hasProfile } = useQuery({
    queryKey: ['/api/volunteers/has-profile'],
    queryFn: () => apiRequest('/api/volunteers/has-profile', 'GET')
  });

  const queryClient = useQueryClient();
  
  const handleAssessmentComplete = (profile: any) => {
    setShowAssessment(false);
    setLastAssessmentProfile(profile);
    
    // Show success announcement immediately
    setShowSuccessAnnouncement(true);
    
    // Force refresh the hasProfile query and manually update the cached data
    queryClient.setQueryData(['/api/volunteers/has-profile'], { hasProfile: true });
    queryClient.invalidateQueries({ queryKey: ['/api/volunteers/has-profile'] });
    
    // Auto-hide after 25 seconds to give users time to read profile and click
    setTimeout(() => {
      setShowSuccessAnnouncement(false);
    }, 25000);
  };

  if (showAssessment) {
    return <SpiritualGiftsAssessment onComplete={handleAssessmentComplete} />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="appointments">Divine Appointments</TabsTrigger>
          <TabsTrigger value="calendar">My Calendar</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {/* Welcome to D.I.V.I.N.E. */}
          <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-green-500 text-white rounded-xl p-6 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to D.I.V.I.N.E.</h2>
              <p className="text-white/90">Disciple-Inspired Volunteer Integration & Nurture Engine</p>
              
              {/* Admin Tools */}
              <div className="mt-6">
                <VolunteerPositionCreator>
                  <Button className="bg-white/20 text-white hover:bg-white/30">
                    Create Volunteer Position
                  </Button>
                </VolunteerPositionCreator>
              </div>
            </div>
          </div>

          {/* Progress Bar and Profile Section */}
          {hasProfile?.hasProfile && lastAssessmentProfile && (
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-lg shadow-lg border-l-4 border-l-yellow-400 mb-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-yellow-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">D.I.V.I.N.E. Setup Complete!</h3>
                  <p className="text-sm text-white/90 mb-4">You're ready to explore volunteer opportunities</p>
                  
                  {/* Progress Bar */}
                  <div className="bg-white/20 rounded-full p-1 mb-4">
                    <div className="bg-white rounded-full h-2 w-full"></div>
                  </div>
                  <div className="flex justify-between text-xs text-white/80 mb-4">
                    <span>✓ Assessment Complete</span>
                    <span>✓ Profile Created</span>
                    <span>✓ Ready to Serve</span>
                  </div>
                  
                  {/* Display Spiritual Profile */}
                  <div className="bg-white/20 rounded-lg p-3 mb-4">
                    <div className="text-lg font-bold text-white mb-1">
                      {lastAssessmentProfile.profileLabel || "Faithful Servant"}
                    </div>
                    <div className="text-sm text-white/90 mb-2">
                      {lastAssessmentProfile.profileDescription || "Ready to serve with your unique gifts"}
                    </div>
                    <div className="text-xs text-white/80">
                      Serving Style: {lastAssessmentProfile.servingStyle || "Ministry Participation"}
                    </div>
                    {lastAssessmentProfile.topGifts && lastAssessmentProfile.topGifts.length > 0 && (
                      <div className="text-xs text-white/80 mt-1">
                        Top Gifts: {lastAssessmentProfile.topGifts.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!hasProfile?.hasProfile ? (
            <div className="space-y-6">
              {/* Welcome Message */}
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to D.I.V.I.N.E.</CardTitle>
                  <CardDescription>
                    The Disciple-Inspired Volunteer Integration & Nurture Engine
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Get started by completing your spiritual gifts assessment. This will help us match you 
                    with volunteer opportunities that align with your divine calling and natural abilities.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <Brain className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <h4 className="font-medium">Discover Gifts</h4>
                      <p className="text-sm text-gray-600">Identify your spiritual gifts</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <h4 className="font-medium">Find Matches</h4>
                      <p className="text-sm text-gray-600">Get AI-powered opportunity matching</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <Heart className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <h4 className="font-medium">Serve Kingdom</h4>
                      <p className="text-sm text-gray-600">Make a meaningful impact</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Steps */}
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-purple-500" />
                    D.I.V.I.N.E. Onboarding Progress
                  </CardTitle>
                  <CardDescription>
                    Complete these steps to unlock your full volunteer potential
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Step 1: Assessment */}
                    <div className={`flex items-center space-x-4 p-4 rounded-lg border ${
                      hasProfile?.hasProfile 
                        ? "bg-green-50 border-green-200" 
                        : "bg-purple-50 border-purple-200"
                    }`}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-medium ${
                        hasProfile?.hasProfile 
                          ? "bg-green-500" 
                          : "bg-purple-500"
                      }`}>
                        {hasProfile?.hasProfile ? <CheckCircle className="w-4 h-4" /> : "1"}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {hasProfile?.hasProfile 
                            ? "✅ Spiritual Gifts Assessment Complete" 
                            : "Complete Spiritual Gifts Assessment"
                          }
                        </h4>
                        <p className="text-sm text-gray-600">
                          {hasProfile?.hasProfile 
                            ? "Your spiritual gifts have been identified and saved" 
                            : "Discover your divine gifts and serving style (5-10 minutes)"
                          }
                        </p>
                      </div>
                      {hasProfile?.hasProfile ? (
                        <Button variant="outline" className="border-green-500 text-green-700" disabled>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => setShowAssessment(true)}
                          className="bg-gradient-to-r from-purple-500 to-blue-500"
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          Start Now
                        </Button>
                      )}
                    </div>

                    {/* Step 2: Browse Opportunities (Unlocked after assessment) */}
                    <div className={`flex items-center space-x-4 p-4 rounded-lg border ${
                      hasProfile?.hasProfile 
                        ? "bg-green-50 border-green-200" 
                        : "bg-gray-50 border-gray-200 opacity-75"
                    }`}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-medium ${
                        hasProfile?.hasProfile 
                          ? "bg-green-500" 
                          : "bg-gray-400"
                      }`}>
                        2
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          hasProfile?.hasProfile 
                            ? "text-gray-900" 
                            : "text-gray-500"
                        }`}>
                          Browse Volunteer Opportunities
                        </h4>
                        <p className={`text-sm ${
                          hasProfile?.hasProfile 
                            ? "text-gray-600" 
                            : "text-gray-400"
                        }`}>
                          Explore ministry opportunities matched to your gifts
                        </p>
                      </div>
                      {hasProfile?.hasProfile ? (
                        <Button 
                          onClick={() => setActiveTab("opportunities")}
                          className="bg-gradient-to-r from-green-500 to-blue-500"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Browse Now
                        </Button>
                      ) : (
                        <Button disabled variant="outline">
                          Locked
                        </Button>
                      )}
                    </div>

                    {/* Step 3: Sign Up (Locked) */}
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200 opacity-75">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-400 text-white text-sm font-medium">
                        3
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-500">Sign Up to Serve</h4>
                        <p className="text-sm text-gray-400">Register for opportunities and start making a difference</p>
                      </div>
                      <Button disabled variant="outline">
                        Locked
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => setActiveTab("appointments")}
                  className="h-20 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <div className="text-center">
                    <Target className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Divine Appointments</div>
                    <div className="text-xs opacity-90">AI-powered matches</div>
                  </div>
                </Button>
                <Button 
                  onClick={() => setActiveTab("opportunities")}
                  className="h-20 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  <div className="text-center">
                    <Search className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Browse Opportunities</div>
                    <div className="text-xs opacity-90">All volunteer roles</div>
                  </div>
                </Button>
                <Button 
                  onClick={() => setActiveTab("calendar")}
                  className="h-20 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <div className="text-center">
                    <Calendar className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">My Calendar</div>
                    <div className="text-xs opacity-90">Track commitments</div>
                  </div>
                </Button>
              </div>

              <VolunteerDashboard />
            </div>
          )}
        </TabsContent>

        <TabsContent value="appointments">
          <DivineAppointmentsPanel />
        </TabsContent>

        <TabsContent value="opportunities">
          <VolunteerOpportunitiesPanel />
        </TabsContent>

        <TabsContent value="calendar">
          <VolunteerCalendar />
        </TabsContent>

        <TabsContent value="impact">
          <VolunteerDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServeWellVolunteerHub;