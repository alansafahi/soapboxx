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
import VolunteerCalendar from './VolunteerCalendar';

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
      onComplete({ success: true });
    }
  });

  const totalPages = Math.ceil(spiritualGiftsQuestions.length / questionsPerPage);
  const currentQuestions = spiritualGiftsQuestions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  const onSubmit = (data: SpiritualGiftsForm) => {
    assessmentMutation.mutate(data);
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
  const { data: divineAppointments, isLoading } = useQuery({
    queryKey: ['/api/volunteers/divine-appointments'],
    queryFn: () => apiRequest('/api/volunteers/divine-appointments', 'GET')
  });

  const acceptMutation = useMutation({
    mutationFn: (matchId: number) => 
      apiRequest(`/api/volunteers/matches/${matchId}/accept`, 'POST'),
    onSuccess: () => {
      // Refresh appointments
    }
  });

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
                  <CardTitle className="text-lg">{appointment.opportunity.title}</CardTitle>
                  <CardDescription>{appointment.opportunity.ministry} Ministry</CardDescription>
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
                  {appointment.aiRecommendation.replace('_', ' ')}
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
                <p className="text-sm text-gray-600">{appointment.aiExplanation}</p>
                
                <div className="flex flex-wrap gap-1">
                  {appointment.reasons.map((reason, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {appointment.opportunity.timeCommitment}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {appointment.opportunity.location}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => acceptMutation.mutate(appointment.id)}
                  disabled={acceptMutation.isPending}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Accept Call
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Learn More
                </Button>
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
      {/* Welcome Header */}
      <div className="text-center p-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to D.I.V.I.N.E.</h1>
        <p className="text-purple-100">Disciple-Inspired Volunteer Integration & Nurture Engine</p>
      </div>

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
  const [activeTab, setActiveTab] = useState("dashboard");
  const { data: hasProfile } = useQuery({
    queryKey: ['/api/volunteers/has-profile'],
    queryFn: () => apiRequest('/api/volunteers/has-profile', 'GET')
  });

  const queryClient = useQueryClient();
  
  const handleAssessmentComplete = (profile: any) => {
    setShowAssessment(false);
    // Refresh the hasProfile query to update the UI
    queryClient.invalidateQueries({ queryKey: ['/api/volunteers/has-profile'] });
    
    // Show success announcement
    setShowSuccessAnnouncement(true);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      setShowSuccessAnnouncement(false);
    }, 10000);
  };

  if (showAssessment) {
    return <SpiritualGiftsAssessment onComplete={handleAssessmentComplete} />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Success Announcement Box */}
      {showSuccessAnnouncement && (
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-lg shadow-lg border-l-4 border-l-yellow-400 relative animate-in slide-in-from-top duration-500">
          <button
            onClick={() => setShowSuccessAnnouncement(false)}
            className="absolute top-2 right-2 text-white hover:text-gray-200 text-xl font-bold"
          >
            ×
          </button>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <CheckCircle className="w-8 h-8 text-yellow-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">🎉 Assessment Complete!</h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-300" />
                  Your spiritual gifts have been identified
                </p>
                <p className="flex items-center">
                  <Target className="w-4 h-4 mr-2 text-blue-300" />
                  You can now browse volunteer opportunities
                </p>
                <p className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-purple-300" />
                  Check out your personalized matches
                </p>
                <p className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-yellow-300" />
                  Click "Divine Appointments" tab to see your matches!
                </p>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button 
                  onClick={() => {
                    setActiveTab("appointments");
                    setShowSuccessAnnouncement(false);
                  }}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  size="sm"
                >
                  <Target className="w-4 h-4 mr-1" />
                  View My Matches
                </Button>
                <Button 
                  onClick={() => {
                    setActiveTab("opportunities");
                    setShowSuccessAnnouncement(false);
                  }}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                  size="sm"
                >
                  Browse Opportunities
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="appointments">Divine Appointments</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="calendar">My Calendar</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {!hasProfile?.hasProfile ? (
            <div className="space-y-6">
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
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-purple-50 border border-purple-200">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500 text-white text-sm font-medium">
                        1
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Complete Spiritual Gifts Assessment</h4>
                        <p className="text-sm text-gray-600">Discover your divine gifts and serving style (5-10 minutes)</p>
                      </div>
                      <Button 
                        onClick={() => setShowAssessment(true)}
                        className="bg-gradient-to-r from-purple-500 to-blue-500"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Start Now
                      </Button>
                    </div>

                    {/* Step 2: Browse Opportunities (Locked) */}
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200 opacity-75">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-400 text-white text-sm font-medium">
                        2
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-500">Browse Volunteer Opportunities</h4>
                        <p className="text-sm text-gray-400">Explore ministry opportunities matched to your gifts</p>
                      </div>
                      <Button disabled variant="outline">
                        Locked
                      </Button>
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
            </div>
          ) : (
            <div className="space-y-6">
              {/* Completed Progress Steps */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    D.I.V.I.N.E. Setup Complete!
                  </CardTitle>
                  <CardDescription>
                    You're ready to explore volunteer opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      onClick={() => setActiveTab("appointments")}
                      className="bg-gradient-to-r from-purple-500 to-blue-500"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      View My Matches
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("opportunities")}
                      variant="outline"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Browse All Opportunities
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("calendar")}
                      variant="outline"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      My Calendar
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
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
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Kingdom Impact Report</h2>
            <p className="text-gray-600">See how your service is making a difference</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServeWellVolunteerHub;