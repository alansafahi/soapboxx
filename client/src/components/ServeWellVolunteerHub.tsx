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
    }
  });

  const assessmentMutation = useMutation({
    mutationFn: (data: SpiritualGiftsForm) => 
      apiRequest('/api/volunteers/spiritual-gifts-assessment', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: (profile) => {
      onComplete(profile);
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        {q.question}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {q.gift}
                        </Badge>
                      </FormLabel>
                      <FormControl>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-500">Strongly Disagree</span>
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                type="button"
                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  field.value === value
                                    ? 'bg-purple-500 border-purple-500 text-white'
                                    : 'border-gray-300 hover:border-purple-300'
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
                      <FormMessage />
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
    queryFn: () => apiRequest('/api/volunteers/divine-appointments')
  });

  const acceptMutation = useMutation({
    mutationFn: (matchId: number) => 
      apiRequest(`/api/volunteers/matches/${matchId}/accept`, { method: 'POST' }),
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
    queryFn: () => apiRequest('/api/volunteers/profile')
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/volunteers/stats'],
    queryFn: () => apiRequest('/api/volunteers/stats')
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

// Main D.I.V.I.N.E. Component
const ServeWellVolunteerHub = () => {
  const [showAssessment, setShowAssessment] = useState(false);
  const { data: hasProfile } = useQuery({
    queryKey: ['/api/volunteers/has-profile'],
    queryFn: () => apiRequest('/api/volunteers/has-profile')
  });

  const handleAssessmentComplete = (profile: any) => {
    setShowAssessment(false);
    // Refresh queries
  };

  if (showAssessment) {
    return <SpiritualGiftsAssessment onComplete={handleAssessmentComplete} />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="appointments">Divine Appointments</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="teams">My Teams</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {!hasProfile ? (
            <Card className="text-center p-8">
              <CardHeader>
                <CardTitle>Complete Your Spiritual Gifts Assessment</CardTitle>
                <CardDescription>
                  Discover your divine calling and get matched with perfect ministry opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowAssessment(true)}
                  className="bg-gradient-to-r from-purple-500 to-blue-500"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <VolunteerDashboard />
          )}
        </TabsContent>

        <TabsContent value="appointments">
          <DivineAppointmentsPanel />
        </TabsContent>

        <TabsContent value="opportunities">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">All Opportunities</h2>
            <p className="text-gray-600">Browse all available volunteer opportunities</p>
          </div>
        </TabsContent>

        <TabsContent value="teams">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">My Ministry Teams</h2>
            <p className="text-gray-600">Manage your team assignments and relationships</p>
          </div>
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