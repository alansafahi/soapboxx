import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Clock,
  Shield,
  Star,
  Target,
  CheckCircle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Comprehensive Phase 2 form validation schema with all detailed fields
const createPositionSchema = z.object({
  // Basic Information
  title: z.string().min(1, 'Position title is required'),
  ministry: z.string().min(1, 'Ministry selection is required'),
  department: z.string().min(1, 'Department is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  responsibilities: z.string().min(10, 'Responsibilities list is required'),
  
  // Scheduling & Time Commitment
  timeCommitment: z.string().min(1, 'Time commitment is required'),
  timeCommitmentLevel: z.enum(['1-2 hours', '3-5 hours', '6-10 hours', '10+ hours']),
  maxHoursPerWeek: z.number().min(1).max(40),
  location: z.string().min(1, 'Location is required'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  
  // Recurring Assignments (Phase 2)
  isRecurring: z.boolean(),
  recurringPattern: z.string().min(1, 'Pattern required if recurring'),
  recurringDays: z.array(z.string()),
  recurringEndDate: z.date().optional(),
  
  // Requirements & Skills
  backgroundCheckRequired: z.boolean(),
  backgroundCheckLevel: z.enum(['basic', 'standard', 'enhanced']).optional(),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  spiritualGiftsNeeded: z.array(z.string()),
  
  // Team Composition (Phase 2)
  volunteersNeeded: z.number().min(1).max(50),
  teamSize: z.number().min(1).max(20),
  teamRoles: z.array(z.string()),
  leadershipRequired: z.boolean(),
  
  // Performance & Tracking (Phase 2)
  performanceMetrics: z.array(z.string()),
  trainingRequired: z.boolean(),
  orientationRequired: z.boolean(),
  mentorshipProvided: z.boolean(),
  
  // Administrative
  coordinatorName: z.string().min(1, 'Coordinator name is required'),
  coordinatorEmail: z.string().email('Valid email required'),
  coordinatorPhone: z.string().optional(),
  budgetRequired: z.boolean(),
  estimatedBudget: z.number().optional(),
  equipmentNeeded: z.string().optional(),
  
  // Advanced Options (Phase 2)
  autoApprove: z.boolean(),
  sendNotifications: z.boolean(),
  trackHours: z.boolean(),
  requireReferences: z.boolean(),
  ageRestriction: z.string().optional()
});

type CreatePositionForm = z.infer<typeof createPositionSchema>;

// Phase 2: Expanded ministry and department options
const ministryOptions = [
  'General Ministry',
  'Children Ministry', 
  'Youth Ministry',
  'Worship & Music',
  'Outreach & Missions',
  'Administration',
  'Facilities & Maintenance',
  'Food & Hospitality',
  'Technology & Media',
  'Small Groups',
  'Prayer Ministry',
  'Senior Ministry',
  'Women Ministry',
  'Men Ministry',
  'Marriage & Family',
  'Counseling & Care',
  'Communications',
  'Finance & Stewardship'
];

const departmentOptions = [
  'Pastoral Care',
  'Community Outreach',
  'Discipleship',
  'Evangelism',
  'Education & Teaching',
  'Creative Arts',
  'Operations',
  'Guest Services',
  'Security & Safety',
  'Transportation'
];

const spiritualGiftsOptions = [
  'Leadership',
  'Teaching',
  'Administration',
  'Mercy',
  'Hospitality',
  'Service',
  'Faith',
  'Giving',
  'Encouragement',
  'Discernment',
  'Wisdom',
  'Evangelism'
];

const performanceMetricsOptions = [
  'Hours Served',
  'People Reached',
  'Events Completed',
  'Training Completed',
  'Feedback Score',
  'Team Collaboration',
  'Reliability',
  'Initiative'
];

const backgroundCheckLevels = [
  { value: 'basic', label: 'Basic Check (ID Verification)' },
  { value: 'standard', label: 'Standard Check (Criminal Background)' },
  { value: 'enhanced', label: 'Enhanced Check (Child Protection)' }
];

const recurringPatterns = [
  'Weekly',
  'Bi-weekly', 
  'Monthly',
  'Quarterly',
  'Special Events',
  'Holiday Season',
  'Summer Only',
  'School Year'
];

const weekDays = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const skillOptions = [
  'Teaching',
  'Child Care',
  'Patience',
  'Communication',
  'Leadership',
  'Organization',
  'Technical Skills',
  'Music',
  'Audio/Visual',
  'Event Planning',
  'Cooking',
  'Cleaning',
  'Counseling',
  'Public Speaking'
];



export default function VolunteerPositionCreator({ children, editOpportunity }: { children: React.ReactNode; editOpportunity?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(editOpportunity?.requiredSkills || []);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(editOpportunity?.preferredSkills || []);
  const [selectedSpiritualGifts, setSelectedSpiritualGifts] = useState<string[]>(editOpportunity?.spiritualGiftsNeeded || []);
  const [selectedPerformanceMetrics, setSelectedPerformanceMetrics] = useState<string[]>(editOpportunity?.performanceMetrics || []);
  const [selectedRecurringDays, setSelectedRecurringDays] = useState<string[]>(editOpportunity?.recurringDays || []);
  const [selectedTeamRoles, setSelectedTeamRoles] = useState<string[]>(editOpportunity?.teamRoles || []);
  const [currentTab, setCurrentTab] = useState<string>('basic');
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Target },
    { id: 'requirements', label: 'Requirements', icon: Shield },  
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'performance', label: 'Performance', icon: Star },
    { id: 'admin', label: 'Admin', icon: CheckCircle }
  ];

  const currentTabIndex = tabs.findIndex(tab => tab.id === currentTab);
  const progressPercentage = ((currentTabIndex + 1) / tabs.length) * 100;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreatePositionForm>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: {
      // Basic Information
      title: editOpportunity?.title || '',
      ministry: editOpportunity?.ministry || 'General Ministry',
      department: editOpportunity?.department || 'Pastoral Care',
      priority: editOpportunity?.priority || 'medium',
      description: editOpportunity?.description || '',
      responsibilities: editOpportunity?.responsibilities || '',
      
      // Scheduling & Time
      timeCommitment: editOpportunity?.timeCommitment || 'Flexible schedule',
      timeCommitmentLevel: editOpportunity?.timeCommitmentLevel || '1-2 hours',
      maxHoursPerWeek: editOpportunity?.maxHoursPerWeek || 2,
      location: editOpportunity?.location || 'Main Church Building',
      
      // Recurring
      isRecurring: editOpportunity?.isRecurring || false,
      recurringPattern: editOpportunity?.recurringPattern || 'Weekly',
      recurringDays: editOpportunity?.recurringDays || [],
      
      // Requirements
      backgroundCheckRequired: editOpportunity?.backgroundCheckRequired || false,
      backgroundCheckLevel: editOpportunity?.backgroundCheckLevel || 'basic',
      requiredSkills: editOpportunity?.requiredSkills || [],
      preferredSkills: editOpportunity?.preferredSkills || [],
      spiritualGiftsNeeded: editOpportunity?.spiritualGiftsNeeded || [],
      
      // Team
      volunteersNeeded: editOpportunity?.volunteersNeeded || 1,
      teamSize: editOpportunity?.teamSize || 1,
      teamRoles: editOpportunity?.teamRoles || [],
      leadershipRequired: editOpportunity?.leadershipRequired || false,
      
      // Performance
      performanceMetrics: editOpportunity?.performanceMetrics || [],
      trainingRequired: editOpportunity?.trainingRequired || false,
      orientationRequired: editOpportunity?.orientationRequired || false,
      mentorshipProvided: editOpportunity?.mentorshipProvided || false,
      
      // Administrative  
      coordinatorName: editOpportunity?.coordinatorName || 'Ministry Coordinator',
      coordinatorEmail: editOpportunity?.coordinatorEmail || 'coordinator@example.com',
      budgetRequired: editOpportunity?.budgetRequired || false,
      
      // Advanced
      autoApprove: editOpportunity?.autoApprove || false,
      sendNotifications: editOpportunity?.sendNotifications !== false, // Default true unless explicitly false
      trackHours: editOpportunity?.trackHours !== false, // Default true unless explicitly false
      requireReferences: editOpportunity?.requireReferences || false
    }
  });

  const createPositionMutation = useMutation({
    mutationFn: async (data: CreatePositionForm) => {
      const requestData = {
        ...data,
        requiredSkills: selectedSkills,
        preferredSkills: preferredSkills,
        spiritualGiftsNeeded: selectedSpiritualGifts,
        performanceMetrics: selectedPerformanceMetrics,
        recurringDays: selectedRecurringDays,
        teamRoles: selectedTeamRoles,
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString(),
        recurringEndDate: data.recurringEndDate?.toISOString()
      };

      if (editOpportunity) {
        // Update existing opportunity
        return apiRequest(`/api/volunteer/opportunities/${editOpportunity.id}`, 'PUT', requestData);
      } else {
        // Create new opportunity
        return apiRequest('/api/volunteer/opportunities', 'POST', requestData);
      }
    },
    onSuccess: () => {
      toast({
        title: editOpportunity ? "Position Updated Successfully" : "Position Created Successfully",
        description: editOpportunity 
          ? "Your volunteer opportunity has been updated with the new information." 
          : "Your volunteer opportunity has been posted and is now available for applications.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/volunteer/opportunities'] });
      setIsOpen(false);
      setCurrentTab('basic');
      setCompletedTabs([]);
      form.reset();
      resetAllSelections();
    },
    onError: (error: any) => {
      toast({
        title: editOpportunity ? "Failed to Update Position" : "Failed to Create Position",
        description: error.message || `An error occurred while ${editOpportunity ? 'updating' : 'creating'} the volunteer position.`,
        variant: "destructive"
      });
    }
  });

  // Helper functions for multi-select fields
  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => {
      const updated = prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill];
      form.setValue('requiredSkills', updated);
      return updated;
    });
  };

  const handlePreferredSkillToggle = (skill: string) => {
    setPreferredSkills(prev => {
      const updated = prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill];
      form.setValue('preferredSkills', updated);
      return updated;
    });
  };

  const handleSpiritualGiftToggle = (gift: string) => {
    setSelectedSpiritualGifts(prev => {
      const updated = prev.includes(gift) 
        ? prev.filter(g => g !== gift)
        : [...prev, gift];
      form.setValue('spiritualGiftsNeeded', updated);
      return updated;
    });
  };

  const handlePerformanceMetricToggle = (metric: string) => {
    setSelectedPerformanceMetrics(prev => {
      const updated = prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric];
      form.setValue('performanceMetrics', updated);
      return updated;
    });
  };

  const handleRecurringDayToggle = (day: string) => {
    setSelectedRecurringDays(prev => {
      const updated = prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day];
      form.setValue('recurringDays', updated);
      return updated;
    });
  };

  const markTabComplete = (tabId: string) => {
    if (!completedTabs.includes(tabId)) {
      setCompletedTabs([...completedTabs, tabId]);
    }
  };

  const goToNextTab = () => {
    markTabComplete(currentTab);
    const nextIndex = currentTabIndex + 1;
    if (nextIndex < tabs.length) {
      setCurrentTab(tabs[nextIndex].id);
    }
  };

  const goToPreviousTab = () => {
    const prevIndex = currentTabIndex - 1;
    if (prevIndex >= 0) {
      setCurrentTab(tabs[prevIndex].id);
    }
  };

  const isTabComplete = (tabId: string) => {
    return completedTabs.includes(tabId);
  };

  const resetAllSelections = () => {
    setSelectedSkills([]);
    setPreferredSkills([]);
    setSelectedSpiritualGifts([]);
    setSelectedPerformanceMetrics([]);
    setSelectedRecurringDays([]);
    setSelectedTeamRoles([]);
    setCurrentTab('basic');
  };

  // Initialize state arrays and form values when editOpportunity changes
  useEffect(() => {
    if (editOpportunity && isOpen) {
      // Reset form with editOpportunity data
      form.reset({
        // Basic Information
        title: editOpportunity.title || '',
        ministry: editOpportunity.ministry || 'General Ministry',
        department: editOpportunity.department || 'Pastoral Care',
        priority: editOpportunity.priority || 'medium',
        description: editOpportunity.description || '',
        responsibilities: editOpportunity.responsibilities || '',
        
        // Scheduling & Time
        timeCommitment: editOpportunity.timeCommitment || 'Flexible schedule',
        timeCommitmentLevel: editOpportunity.timeCommitmentLevel || '1-2 hours',
        maxHoursPerWeek: editOpportunity.maxHoursPerWeek || 2,
        location: editOpportunity.location || 'Main Church Building',
        startDate: editOpportunity.startDate ? new Date(editOpportunity.startDate) : undefined,
        endDate: editOpportunity.endDate ? new Date(editOpportunity.endDate) : undefined,
        
        // Recurring
        isRecurring: editOpportunity.isRecurring || false,
        recurringPattern: editOpportunity.recurringPattern || 'Weekly',
        recurringDays: editOpportunity.recurringDays || [],
        
        // Requirements
        backgroundCheckRequired: editOpportunity.backgroundCheckRequired || false,
        backgroundCheckLevel: editOpportunity.backgroundCheckLevel || 'basic',
        requiredSkills: editOpportunity.requiredSkills || [],
        preferredSkills: editOpportunity.preferredSkills || [],
        spiritualGiftsNeeded: editOpportunity.spiritualGiftsNeeded || [],
        
        // Team
        volunteersNeeded: editOpportunity.volunteersNeeded || 1,
        teamSize: editOpportunity.teamSize || 1,
        teamRoles: editOpportunity.teamRoles || [],
        leadershipRequired: editOpportunity.leadershipRequired || false,
        
        // Performance
        performanceMetrics: editOpportunity.performanceMetrics || [],
        trainingRequired: editOpportunity.trainingRequired || false,
        orientationRequired: editOpportunity.orientationRequired || false,
        mentorshipProvided: editOpportunity.mentorshipProvided || false,
        
        // Administrative  
        coordinatorName: editOpportunity.coordinatorName || 'Ministry Coordinator',
        coordinatorEmail: editOpportunity.coordinatorEmail || 'coordinator@example.com',
        budgetRequired: editOpportunity.budgetRequired || false,
        
        // Advanced
        autoApprove: editOpportunity.autoApprove || false,
        sendNotifications: editOpportunity.sendNotifications !== false, // Default true unless explicitly false
        trackHours: editOpportunity.trackHours !== false, // Default true unless explicitly false
        requireReferences: editOpportunity.requireReferences || false
      });

      // Set state arrays for multi-select components
      setSelectedSkills(editOpportunity.requiredSkills || []);
      setPreferredSkills(editOpportunity.preferredSkills || []);
      setSelectedSpiritualGifts(editOpportunity.spiritualGiftsNeeded || []);
      setSelectedPerformanceMetrics(editOpportunity.performanceMetrics || []);
      setSelectedRecurringDays(editOpportunity.recurringDays || []);
      setSelectedTeamRoles(editOpportunity.teamRoles || []);
      
      // Reset to basic tab when editing
      setCurrentTab('basic');
    } else if (isOpen && !editOpportunity) {
      // Reset form for new position creation
      form.reset({
        // Basic Information
        title: '',
        ministry: 'General Ministry',
        department: 'Pastoral Care',
        priority: 'medium',
        description: '',
        responsibilities: '',
        
        // Scheduling & Time
        timeCommitment: 'Flexible schedule',
        timeCommitmentLevel: '1-2 hours',
        maxHoursPerWeek: 2,
        location: 'Main Church Building',
        startDate: undefined,
        endDate: undefined,
        
        // Recurring
        isRecurring: false,
        recurringPattern: 'Weekly',
        recurringDays: [],
        
        // Requirements
        backgroundCheckRequired: false,
        backgroundCheckLevel: 'basic',
        requiredSkills: [],
        preferredSkills: [],
        spiritualGiftsNeeded: [],
        
        // Team
        volunteersNeeded: 1,
        teamSize: 1,
        teamRoles: [],
        leadershipRequired: false,
        
        // Performance
        performanceMetrics: [],
        trainingRequired: false,
        orientationRequired: false,
        mentorshipProvided: false,
        
        // Administrative  
        coordinatorName: 'Ministry Coordinator',
        coordinatorEmail: 'coordinator@example.com',
        budgetRequired: false,
        
        // Advanced
        autoApprove: false,
        sendNotifications: true,
        trackHours: true,
        requireReferences: false
      });
      
      // Clear all state arrays
      resetAllSelections();
    }
  }, [editOpportunity, isOpen, form]);

  const onSubmit = async (data: CreatePositionForm) => {
    console.log('FORM SUBMITTED!', data);
    
    // Force a complete validation check
    const isValid = await form.trigger();
    console.log('Form validation result:', isValid);
    console.log('Form errors after trigger:', form.formState.errors);
    console.log('Current form values:', form.getValues());
    
    // Log each field and its validation status
    const values = form.getValues();
    Object.keys(values).forEach(key => {
      const value = (values as any)[key];
      console.log(`${key}: ${typeof value} = ${JSON.stringify(value)}`);
    });
    
    // Check for specific validation errors
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      console.log('VALIDATION ERRORS BLOCKING SUBMISSION:', errors);
      Object.keys(errors).forEach(key => {
        const error = (errors as any)[key];
        console.log(`Field ${key} error:`, error?.message || error);
      });
      return;
    }
    
    if (isValid) {
      console.log('Validation passed, triggering mutation...');
      createPositionMutation.mutate(data);
    } else {
      console.log('Form validation failed - form is not valid');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            {editOpportunity ? 'Edit Volunteer Position' : 'Create New Volunteer Position'}
          </DialogTitle>
          <DialogDescription>
            {editOpportunity 
              ? 'Update the details for this volunteer opportunity' 
              : 'Create a detailed volunteer opportunity for your ministry team'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(e) => {
            e.preventDefault();
            // Only allow submission on the final 'admin' tab
            if (currentTab === 'admin') {
              console.log('Form submit event triggered - Admin tab');
              form.handleSubmit(onSubmit)(e);
            } else {
              console.log('Form submission blocked - not on admin tab');
              goToNextTab();
            }
          }} className="space-y-6">
            
            {/* Phase 2 Advanced Tabbed Interface */}
            <div className="border-b">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">{currentTabIndex + 1} of {tabs.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Tab Navigation */}
              <nav className="flex space-x-2 mb-4 overflow-x-auto">
                {tabs.map((tab, index) => {
                  const isActive = currentTab === tab.id;
                  const isCompleted = isTabComplete(tab.id);
                  const isNext = index === currentTabIndex + 1;
                  
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setCurrentTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                        isActive 
                          ? 'bg-purple-100 text-purple-700 border-purple-200 border' 
                          : isCompleted
                          ? 'bg-green-100 text-green-700 border-green-200 border'
                          : isNext
                          ? 'bg-blue-50 text-blue-600 border-blue-200 border animate-pulse'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {isCompleted && <CheckCircle className="w-4 h-4" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Basic Information Tab */}
            {currentTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position Title *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Children Ministry Leader" 
                            {...field}
                            onFocus={(e) => e.target.placeholder = ''}
                            onBlur={(e) => {
                              if (!e.target.value) e.target.placeholder = 'e.g., Children Ministry Leader';
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ministry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ministry *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ministry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="General Ministry">General Ministry</SelectItem>
                            <SelectItem value="Children Ministry">Children Ministry</SelectItem>
                            <SelectItem value="Youth Ministry">Youth Ministry</SelectItem>
                            <SelectItem value="Worship & Music">Worship & Music</SelectItem>
                            <SelectItem value="Outreach & Missions">Outreach & Missions</SelectItem>
                            <SelectItem value="Administration">Administration</SelectItem>
                            <SelectItem value="Facilities & Maintenance">Facilities & Maintenance</SelectItem>
                            <SelectItem value="Food & Hospitality">Food & Hospitality</SelectItem>
                            <SelectItem value="Technology & Media">Technology & Media</SelectItem>
                            <SelectItem value="Small Groups">Small Groups</SelectItem>
                            <SelectItem value="Prayer Ministry">Prayer Ministry</SelectItem>
                            <SelectItem value="Senior Ministry">Senior Ministry</SelectItem>
                            <SelectItem value="Women Ministry">Women Ministry</SelectItem>
                            <SelectItem value="Men Ministry">Men Ministry</SelectItem>
                            <SelectItem value="Marriage & Family">Marriage & Family</SelectItem>
                            <SelectItem value="Counseling & Care">Counseling & Care</SelectItem>
                            <SelectItem value="Communications">Communications</SelectItem>
                            <SelectItem value="Finance & Stewardship">Finance & Stewardship</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Pastoral Care">Pastoral Care</SelectItem>
                            <SelectItem value="Community Outreach">Community Outreach</SelectItem>
                            <SelectItem value="Discipleship">Discipleship</SelectItem>
                            <SelectItem value="Evangelism">Evangelism</SelectItem>
                            <SelectItem value="Education & Teaching">Education & Teaching</SelectItem>
                            <SelectItem value="Creative Arts">Creative Arts</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                            <SelectItem value="Guest Services">Guest Services</SelectItem>
                            <SelectItem value="Security & Safety">Security & Safety</SelectItem>
                            <SelectItem value="Transportation">Transportation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="urgent">Urgent Priority</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide a clear, engaging description of this volunteer role..."
                          rows={4}
                          {...field}
                          onFocus={(e) => e.target.placeholder = ''}
                          onBlur={(e) => {
                            if (!e.target.value) e.target.placeholder = 'Provide a clear, engaging description of this volunteer role...';
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responsibilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Responsibilities *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="• Lead worship sessions&#10;• Prepare materials and setup&#10;• Mentor new volunteers&#10;• Maintain equipment"
                          rows={4}
                          {...field}
                          onFocus={(e) => e.target.placeholder = ''}
                          onBlur={(e) => {
                            if (!e.target.value) e.target.placeholder = '• Lead worship sessions\n• Prepare materials and setup\n• Mentor new volunteers\n• Maintain equipment';
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between pt-6">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={goToPreviousTab}
                    disabled={currentTabIndex === 0}
                  >
                    ← Previous
                  </Button>
                  <Button 
                    type="button"
                    onClick={goToNextTab}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    Next: Requirements →
                  </Button>
                </div>
              </div>
            )}

            {/* Team Tab */}
            {currentTab === 'team' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="volunteersNeeded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volunteers Needed *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="50"
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="teamSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Size *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="20"
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="leadershipRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Leadership Role</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            This position requires leadership and supervisory skills
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Team Roles (Optional)</FormLabel>
                    <div className="mt-2">
                      <Textarea 
                        placeholder="• Team Leader - Coordinate activities&#10;• Assistant - Support main tasks&#10;• Specialist - Handle technical aspects"
                        rows={3}
                        onChange={(e) => {
                          const roles = e.target.value.split('\n').filter(r => r.trim());
                          setSelectedTeamRoles(roles);
                          form.setValue('teamRoles', roles);
                        }}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="mentorshipProvided"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Mentorship Provided</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            New volunteers will receive mentorship and guidance
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {currentTab === 'performance' && (
              <div className="space-y-6">
                <div>
                  <FormLabel>Performance Metrics</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {performanceMetricsOptions.map(metric => (
                      <div
                        key={metric}
                        onClick={() => handlePerformanceMetricToggle(metric)}
                        className={`cursor-pointer text-sm px-3 py-2 rounded-md border ${
                          selectedPerformanceMetrics.includes(metric)
                            ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {metric}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="orientationRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Orientation Required</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Volunteers need orientation session
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="trackHours"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Track Volunteer Hours</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Monitor and record volunteer time
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="ageRestriction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age Restriction (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select age requirement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No restriction</SelectItem>
                          <SelectItem value="16+">16 years and older</SelectItem>
                          <SelectItem value="18+">18 years and older</SelectItem>
                          <SelectItem value="21+">21 years and older</SelectItem>
                          <SelectItem value="Adult only">Adults only</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Admin Tab */}
            {currentTab === 'admin' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="coordinatorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coordinator Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Pastor John Smith" 
                            {...field}
                            onFocus={(e) => e.target.placeholder = ''}
                            onBlur={(e) => {
                              if (!e.target.value) e.target.placeholder = 'e.g., Pastor John Smith';
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coordinatorEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coordinator Email *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="coordinator@church.org" 
                            {...field}
                            onFocus={(e) => e.target.placeholder = ''}
                            onBlur={(e) => {
                              if (!e.target.value) e.target.placeholder = 'coordinator@church.org';
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="coordinatorPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coordinator Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="budgetRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Budget Required</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            This position requires funding/budget
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch('budgetRequired') && (
                    <FormField
                      control={form.control}
                      name="estimatedBudget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Budget</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              placeholder="500"
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="equipmentNeeded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment/Materials Needed (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="• Microphone and sound equipment&#10;• Teaching materials and supplies&#10;• Safety equipment (if applicable)"
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Advanced Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="autoApprove"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Auto-Approve Applications</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Automatically approve volunteer applications
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sendNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Send Notifications</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Notify coordinator of new applications
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Requirements Tab */}
            {currentTab === 'requirements' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="backgroundCheckRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Background Check Required</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            This role requires volunteers to complete a background check
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch('backgroundCheckRequired') && (
                    <FormField
                      control={form.control}
                      name="backgroundCheckLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Background Check Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="basic">Basic Check (ID Verification)</SelectItem>
                                <SelectItem value="standard">Standard Check (Criminal Background)</SelectItem>
                                <SelectItem value="enhanced">Enhanced Check (Child Protection)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <FormLabel>Required Skills</FormLabel>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {skillOptions.map(skill => (
                        <div
                          key={skill}
                          onClick={() => handleSkillToggle(skill)}
                          className={`cursor-pointer text-sm px-3 py-2 rounded-md border ${
                            selectedSkills.includes(skill)
                              ? 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FormLabel>Preferred Skills (Optional)</FormLabel>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {skillOptions.map(skill => (
                        <div
                          key={skill}
                          onClick={() => handlePreferredSkillToggle(skill)}
                          className={`cursor-pointer text-sm px-3 py-2 rounded-md border ${
                            preferredSkills.includes(skill)
                              ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FormLabel>Spiritual Gifts Needed</FormLabel>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {spiritualGiftsOptions.map(gift => (
                        <div
                          key={gift}
                          onClick={() => handleSpiritualGiftToggle(gift)}
                          className={`cursor-pointer text-sm px-3 py-2 rounded-md border ${
                            selectedSpiritualGifts.includes(gift)
                              ? 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
                              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {gift}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="trainingRequired"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Training Required</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Volunteers must complete training
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requireReferences"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>References Required</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Require character references
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {currentTab === 'schedule' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="timeCommitment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Commitment *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select schedule" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Flexible schedule">Flexible schedule</SelectItem>
                            <SelectItem value="1-2 hours/week">1-2 hours/week</SelectItem>
                            <SelectItem value="3-5 hours/week">3-5 hours/week</SelectItem>
                            <SelectItem value="5-10 hours/week">5-10 hours/week</SelectItem>
                            <SelectItem value="One-time event">One-time event</SelectItem>
                            <SelectItem value="Monthly commitment">Monthly commitment</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeCommitmentLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hours Per Week *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select hours" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                            <SelectItem value="3-5 hours">3-5 hours</SelectItem>
                            <SelectItem value="6-10 hours">6-10 hours</SelectItem>
                            <SelectItem value="10+ hours">10+ hours</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Main Sanctuary, Room 204" 
                            {...field}
                            onFocus={(e) => e.target.placeholder = ''}
                            onBlur={(e) => {
                              if (!e.target.value) e.target.placeholder = 'e.g., Main Sanctuary, Room 204';
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxHoursPerWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Hours Per Week</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="40"
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isRecurring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Recurring Assignment</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            This position has ongoing/recurring commitments
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch('isRecurring') && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="recurringPattern"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recurring Pattern</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select pattern" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="Weekly">Weekly</SelectItem>
                                  <SelectItem value="Monthly">Monthly</SelectItem>
                                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <FormLabel>Recurring Days</FormLabel>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {weekDays.map(day => (
                            <div
                              key={day}
                              onClick={() => handleRecurringDayToggle(day)}
                              className={`cursor-pointer text-sm px-2 py-2 rounded-md border text-center ${
                                selectedRecurringDays.includes(day)
                                  ? 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              {day.substring(0, 3)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick end date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Form Actions - Only show Create Position on last tab */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    resetAllSelections();
                    setCurrentTab('basic');
                    setCompletedTabs([]);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reset All
                </Button>
                
                <div className="text-sm text-gray-500">
                  Step {currentTabIndex + 1} of {tabs.length}: {tabs[currentTabIndex].label}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>

                {currentTab === 'basic' ? (
                  <Button 
                    type="button"
                    onClick={goToNextTab}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    Start Creating →
                  </Button>
                ) : currentTab === 'admin' ? (
                  <Button
                    type="submit"
                    disabled={createPositionMutation.isPending}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {createPositionMutation.isPending ? (
                      <>{editOpportunity ? 'Updating Position...' : 'Creating Position...'}</>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {editOpportunity ? 'Update Position' : 'Create Position'}
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={goToPreviousTab}
                      disabled={currentTabIndex === 0}
                    >
                      ← Previous
                    </Button>
                    <Button 
                      type="button"
                      onClick={goToNextTab}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      Next: {tabs[currentTabIndex + 1]?.label} →
                    </Button>
                  </>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
