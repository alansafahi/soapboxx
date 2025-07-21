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
  responsibilities: z.union([z.string(), z.array(z.string())]).transform((val) => 
    Array.isArray(val) ? val : [val]
  ),
  
  // Scheduling & Time Commitment
  timeCommitment: z.string().min(1, 'Time commitment is required'),
  timeCommitmentLevel: z.enum(['1-2 hours', '3-5 hours', '6-10 hours', '10+ hours']),
  maxHoursPerWeek: z.number().min(1).max(40),
  location: z.string().min(1, 'Location is required'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  
  // Recurring Assignments (Phase 2)
  isRecurring: z.boolean(),
  recurringPattern: z.union([z.string(), z.object({ pattern: z.string() })]).optional(),
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
  teamSize: z.number().min(1).max(100),
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

// Skills Matrix Component
function SkillsMatrix({ 
  skills, 
  requiredSkills, 
  preferredSkills, 
  spiritualGifts,
  onRequiredChange,
  onPreferredChange, 
  onSpiritualChange 
}: {
  skills: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  spiritualGifts: string[];
  onRequiredChange: (skills: string[]) => void;
  onPreferredChange: (skills: string[]) => void;
  onSpiritualChange: (skills: string[]) => void;
}) {
  const handleCellClick = (skill: string, column: 'required' | 'preferred' | 'spiritual' | 'none') => {
    // Remove skill from all categories first
    const newRequired = requiredSkills.filter(s => s !== skill);
    const newPreferred = preferredSkills.filter(s => s !== skill);
    const newSpiritual = spiritualGifts.filter(s => s !== skill);
    
    // Add to selected category
    if (column === 'required') {
      newRequired.push(skill);
    } else if (column === 'preferred') {
      newPreferred.push(skill);
    } else if (column === 'spiritual') {
      newSpiritual.push(skill);
    }
    
    onRequiredChange(newRequired);
    onPreferredChange(newPreferred);
    onSpiritualChange(newSpiritual);
  };
  
  const getSkillStatus = (skill: string): 'required' | 'preferred' | 'spiritual' | 'none' => {
    if (requiredSkills.includes(skill)) return 'required';
    if (preferredSkills.includes(skill)) return 'preferred';
    if (spiritualGifts.includes(skill)) return 'spiritual';
    return 'none';
  };
  
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Skills Matrix - Click to categorize each skill
      </div>
      
      {/* Matrix Header */}
      <div className="grid grid-cols-5 gap-2 mb-2">
        <div className="font-medium text-sm text-gray-600 dark:text-gray-400">Skill</div>
        <div className="text-center font-medium text-sm text-red-600">Required</div>
        <div className="text-center font-medium text-sm text-blue-600">Preferred</div>
        <div className="text-center font-medium text-sm text-purple-600">Spiritual Gift</div>
        <div className="text-center font-medium text-sm text-gray-500">N/A</div>
      </div>
      
      {/* Matrix Rows */}
      <div className="max-h-96 overflow-y-auto space-y-1">
        {skills.map((skill) => {
          const status = getSkillStatus(skill);
          return (
            <div key={skill} className="grid grid-cols-5 gap-2 items-center py-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
              <div className="text-sm text-gray-700 dark:text-gray-300 truncate" title={skill}>
                {skill}
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleCellClick(skill, 'required')}
                  className={cn(
                    "w-6 h-6 rounded border-2 transition-colors",
                    status === 'required' 
                      ? "bg-red-500 border-red-500" 
                      : "border-gray-300 hover:border-red-400"
                  )}
                />
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleCellClick(skill, 'preferred')}
                  className={cn(
                    "w-6 h-6 rounded border-2 transition-colors",
                    status === 'preferred' 
                      ? "bg-blue-500 border-blue-500" 
                      : "border-gray-300 hover:border-blue-400"
                  )}
                />
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleCellClick(skill, 'spiritual')}
                  className={cn(
                    "w-6 h-6 rounded border-2 transition-colors",
                    status === 'spiritual' 
                      ? "bg-purple-500 border-purple-500" 
                      : "border-gray-300 hover:border-purple-400"
                  )}
                />
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleCellClick(skill, 'none')}
                  className={cn(
                    "w-6 h-6 rounded border-2 transition-colors",
                    status === 'none' 
                      ? "bg-gray-400 border-gray-400" 
                      : "border-gray-300 hover:border-gray-400"
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
        <div>
          <div className="text-sm font-medium text-red-600">Required ({requiredSkills.length})</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Must have these skills</div>
        </div>
        <div>
          <div className="text-sm font-medium text-blue-600">Preferred ({preferredSkills.length})</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Nice to have skills</div>
        </div>
        <div>
          <div className="text-sm font-medium text-purple-600">Spiritual Gifts ({spiritualGifts.length})</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">God-given abilities</div>
        </div>
      </div>
    </div>
  );
}

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

// Comprehensive skills matrix covering all ministries
const skillOptions = [
  // Teaching & Education
  'Teaching',
  'Sunday School',
  'Curriculum Development',
  'Bible Study Leadership',
  'Training & Development',
  
  // Children & Youth
  'Child Care',
  'Youth Mentoring',
  'Age-Appropriate Communication',
  'Patience with Children',
  'Safety & First Aid',
  
  // Music & Creative Arts
  'Music Performance',
  'Instrument Playing',
  'Vocal Leadership',
  'Sound Engineering',
  'Worship Leading',
  'Art & Design',
  'Photography',
  'Video Production',
  
  // Technical & Media
  'Audio/Visual Equipment',
  'Live Streaming',
  'Computer Skills',
  'Social Media',
  'Website Management',
  'Graphic Design',
  
  // Communication & Leadership
  'Public Speaking',
  'Communication',
  'Leadership',
  'Team Management',
  'Conflict Resolution',
  'Interpersonal Skills',
  
  // Administration & Organization
  'Organization',
  'Event Planning',
  'Project Management',
  'Data Entry',
  'Financial Management',
  'Record Keeping',
  
  // Facilities & Maintenance
  'Maintenance & Repair',
  'Electrical Work',
  'Plumbing',
  'Landscaping',
  'Cleaning',
  'Security',
  'Carpentry',
  
  // Food & Hospitality
  'Cooking',
  'Food Service',
  'Event Catering',
  'Kitchen Management',
  'Hospitality',
  'Guest Relations',
  
  // Care & Counseling
  'Counseling',
  'Pastoral Care',
  'Crisis Support',
  'Mental Health Awareness',
  'Prayer Ministry',
  'Grief Support',
  
  // Outreach & Missions
  'Community Outreach',
  'Evangelism',
  'Cultural Sensitivity',
  'Language Skills',
  'Transportation',
  'Driving'
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
      recurringPattern: editOpportunity?.recurringPattern || '',
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
      // Invalidate all volunteer-related queries to refresh the opportunities list
      queryClient.invalidateQueries({ queryKey: ['/api/volunteer/opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/volunteers/opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['volunteer-opportunities'] });
      
      // Close dialog and reset form
      setIsOpen(false);
      setCurrentTab('basic');
      setCompletedTabs([]);
      form.reset();
      resetAllSelections();
      
      // Force page refresh after a short delay to ensure data is visible
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: editOpportunity ? "Failed to Update Position" : "Failed to Create Position",
        description: error.message || `An error occurred while ${editOpportunity ? 'updating' : 'creating'} the volunteer position.`,
        variant: "destructive"
      });
    }
  });

  // Helper functions for multi-select fields - Enhanced for Matrix
  const handleSkillToggle = (skill: string) => {
    // If currently required (red), remove it completely
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(prev => {
        const updated = prev.filter(s => s !== skill);
        form.setValue('requiredSkills', updated);
        return updated;
      });
    }
    // If currently preferred (blue), remove from preferred and make required (red)
    else if (preferredSkills.includes(skill)) {
      setPreferredSkills(prev => {
        const updated = prev.filter(s => s !== skill);
        form.setValue('preferredSkills', updated);
        return updated;
      });
      setSelectedSkills(prev => {
        const updated = [...prev, skill];
        form.setValue('requiredSkills', updated);
        return updated;
      });
    }
    // Not selected anywhere, make preferred (blue)
    else {
      setPreferredSkills(prev => {
        const updated = [...prev, skill];
        form.setValue('preferredSkills', updated);
        return updated;
      });
    }
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
    console.log('useEffect triggered:', { 
      hasEditOpportunity: !!editOpportunity, 
      isOpen, 
      opportunityTitle: editOpportunity?.title,
      opportunityMinistry: editOpportunity?.ministry,
      opportunityDepartment: editOpportunity?.department
    });
    if (editOpportunity && isOpen) {
      console.log('Resetting form with edit data:', {
        id: editOpportunity.id,
        title: editOpportunity.title,
        ministry: editOpportunity.ministry,
        department: editOpportunity.department,
        allData: editOpportunity
      });
      // Use individual setValue calls instead of reset to force UI updates
      const formData = {
        // Basic Information
        title: editOpportunity.title || '',
        ministry: editOpportunity.ministry || 'General Ministry',
        department: editOpportunity.category || 'Pastoral Care', // Map category to department
        priority: editOpportunity.priority || 'medium',
        description: editOpportunity.description || '',
        responsibilities: editOpportunity.responsibilities || editOpportunity.description || '',
        
        // Scheduling & Time
        timeCommitment: editOpportunity.time_commitment || editOpportunity.timeCommitment || 'Flexible schedule',
        timeCommitmentLevel: (editOpportunity.time_commitment_level || editOpportunity.timeCommitmentLevel) as any || '1-2 hours',
        maxHoursPerWeek: editOpportunity.max_hours_per_week || editOpportunity.maxHoursPerWeek || 2,
        location: editOpportunity.location || 'Main Church Building',
        startDate: editOpportunity.start_date ? new Date(editOpportunity.start_date) : 
                  editOpportunity.startDate ? new Date(editOpportunity.startDate) : undefined,
        endDate: editOpportunity.end_date ? new Date(editOpportunity.end_date) : 
                editOpportunity.endDate ? new Date(editOpportunity.endDate) : undefined,
        
        // Recurring
        isRecurring: editOpportunity.is_recurring || editOpportunity.isRecurring || false,
        recurringPattern: editOpportunity.recurring_pattern || editOpportunity.recurringPattern || 'Weekly',
        recurringDays: editOpportunity.recurringDays || [],
        
        // Requirements
        backgroundCheckRequired: editOpportunity.background_check_required || editOpportunity.backgroundCheckRequired || false,
        backgroundCheckLevel: (editOpportunity.background_check_level || editOpportunity.backgroundCheckLevel) as any || 'basic',
        requiredSkills: editOpportunity.required_skills || editOpportunity.requiredSkills || [],
        preferredSkills: editOpportunity.preferredSkills || [],
        spiritualGiftsNeeded: editOpportunity.spiritual_gifts || editOpportunity.spiritualGiftsNeeded || [],
        
        // Team
        volunteersNeeded: editOpportunity.volunteers_needed || editOpportunity.volunteersNeeded || 1,
        teamSize: editOpportunity.team_size || editOpportunity.teamSize || editOpportunity.volunteers_needed || editOpportunity.volunteersNeeded || 1,
        teamRoles: editOpportunity.team_roles || editOpportunity.teamRoles || [],
        leadershipRequired: editOpportunity.leadership_required || editOpportunity.leadershipRequired || false,
        
        // Performance
        performanceMetrics: editOpportunity.performance_metrics || editOpportunity.performanceMetrics || [],
        trainingRequired: editOpportunity.training_required || editOpportunity.trainingRequired || false,
        orientationRequired: editOpportunity.orientation_required || editOpportunity.orientationRequired || false,
        mentorshipProvided: editOpportunity.mentorship_provided || editOpportunity.mentorshipProvided || false,
        
        // Administrative  
        coordinatorName: 'Ministry Coordinator', // Default since coordinator details not readily available
        coordinatorEmail: 'coordinator@example.com', // Default since coordinator details not readily available  
        budgetRequired: editOpportunity.budgetRequired || false,
        
        // Advanced
        autoApprove: editOpportunity.autoApprove || false,
        sendNotifications: editOpportunity.sendNotifications !== false, // Default true unless explicitly false
        trackHours: editOpportunity.trackHours !== false, // Default true unless explicitly false
        requireReferences: editOpportunity.requireReferences || false
      };

      // Reset form first
      form.reset(formData);
      
      // Then force individual field updates with setValue to trigger UI updates
      Object.entries(formData).forEach(([key, value]) => {
        form.setValue(key as any, value, { shouldValidate: false, shouldDirty: false, shouldTouch: false });
      });
      
      // Force a complete form re-render by triggering validation
      form.trigger();

      // Set state arrays for multi-select components
      setSelectedSkills(editOpportunity.required_skills || editOpportunity.requiredSkills || []);
      setPreferredSkills(editOpportunity.preferredSkills || []);
      setSelectedSpiritualGifts(editOpportunity.spiritual_gifts || editOpportunity.spiritualGiftsNeeded || []);
      setSelectedPerformanceMetrics(editOpportunity.performanceMetrics || []);
      setSelectedRecurringDays(editOpportunity.recurringDays || []);
      setSelectedTeamRoles(editOpportunity.teamRoles || []);
      
      // Reset to basic tab when editing
      setCurrentTab('basic');
      
      // Debug form values after reset
      setTimeout(() => {
        const currentFormValues = form.getValues();
        console.log('Form values after reset:', {
          title: currentFormValues.title,
          ministry: currentFormValues.ministry,
          department: currentFormValues.department,
          description: currentFormValues.description,
          volunteersNeeded: currentFormValues.volunteersNeeded,
          allFormValues: currentFormValues
        });
      }, 100);
    } else if (isOpen && !editOpportunity) {
      // Reset form for new position creation
      form.reset({
        // Basic Information
        title: '',
        ministry: 'General Ministry',
        department: 'Pastoral Care',
        priority: 'medium',
        description: '',
        responsibilities: [],
        
        // Scheduling & Time
        timeCommitment: 'Flexible schedule',
        timeCommitmentLevel: '1-2 hours' as const,
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
        backgroundCheckLevel: 'basic' as const,
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
    console.log('🎯 FORM SUBMISSION STARTED!');
    console.log('📋 Form data received:', data);
    console.log('📊 Form state valid:', form.formState.isValid);
    console.log('🚨 Form errors:', form.formState.errors);
    
    try {
      console.log('✅ Validation passed, calling mutation...');
      await createPositionMutation.mutateAsync(data);
      console.log('🎉 Position created successfully!');
    } catch (error: any) {
      console.error('❌ Mutation failed:', error);
      toast({
        title: "Failed to Create Position",
        description: error.message || "An error occurred while creating the position.",
        variant: "destructive"
      });
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
              console.log('Current form values before submission:', form.getValues());
              console.log('Form errors before submission:', form.formState.errors);
              form.handleSubmit(onSubmit, (errors) => {
                console.log('Form submission failed with errors:', errors);
                toast({
                  title: "Form Validation Failed",
                  description: `Please fix: ${Object.keys(errors).join(', ')}`,
                  variant: "destructive"
                });
              })(e);
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                      <Select onValueChange={field.onChange} value={field.value || ""}>
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
                {/* Skills Matrix - Enhanced UI/UX */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Skills & Requirements Matrix
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Select required and preferred skills for this volunteer position. Use the color-coded system below.
                  </div>
                  
                  {/* Skills Requirements Matrix - Compact Spreadsheet */}
                  <div className="border rounded-lg bg-white dark:bg-gray-900 overflow-hidden">
                    {/* Legend */}
                    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 border-b text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span>Required</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span>Preferred</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-purple-500 rounded"></div>
                        <span>Spiritual Gift</span>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">Click boxes to select</span>
                    </div>

                    {/* Compact Spreadsheet Table */}
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                          <tr>
                            <th className="text-left p-2 border-r dark:border-gray-700 font-medium w-48">Skill/Requirement</th>
                            <th className="text-center p-2 border-r dark:border-gray-700 font-medium w-16">Required</th>
                            <th className="text-center p-2 border-r dark:border-gray-700 font-medium w-16">Preferred</th>
                            <th className="text-center p-2 border-r dark:border-gray-700 font-medium w-20">Spiritual Gift</th>
                            <th className="text-center p-2 font-medium w-16">N/A</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Administrative Skills */}
                          <tr className="border-t dark:border-gray-700">
                            <td colSpan={5} className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-gray-100 text-sm">
                              📋 Administrative & Organization
                            </td>
                          </tr>
                          {['Organization', 'Data Entry', 'Record Keeping', 'Event Planning', 'Project Management', 'Financial Management'].map(skill => (
                            <tr key={skill} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="p-2 border-r dark:border-gray-700">{skill}</td>
                              <td className="p-2 border-r dark:border-gray-700 text-center">
                                <div
                                  onClick={() => handleSkillToggle(skill)}
                                  className={`w-4 h-4 mx-auto rounded cursor-pointer border transition-colors ${
                                    selectedSkills.includes(skill)
                                      ? 'bg-red-500 border-red-500'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-red-400'
                                  }`}
                                />
                              </td>
                              <td className="p-2 border-r dark:border-gray-700 text-center">
                                <div
                                  onClick={() => handleSkillToggle(skill)}
                                  className={`w-4 h-4 mx-auto rounded cursor-pointer border transition-colors ${
                                    preferredSkills.includes(skill)
                                      ? 'bg-blue-500 border-blue-500'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                                  }`}
                                />
                              </td>
                              <td className="p-2 border-r dark:border-gray-700 text-center">
                                {(skill === 'Organization' || skill === 'Project Management' || skill === 'Financial Management') && (
                                  <div
                                    onClick={() => handleSpiritualGiftToggle(skill === 'Organization' || skill === 'Project Management' ? 'Administration' : 'Giving')}
                                    className={`w-4 h-4 mx-auto rounded cursor-pointer border transition-colors ${
                                      selectedSpiritualGifts.includes(skill === 'Organization' || skill === 'Project Management' ? 'Administration' : 'Giving')
                                        ? 'bg-purple-500 border-purple-500'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                                    }`}
                                  />
                                )}
                              </td>
                              <td className="p-2 text-center">
                                <div className="w-4 h-4 mx-auto border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 cursor-not-allowed"></div>
                              </td>
                            </tr>
                          ))}

                          {/* Technical Skills */}
                          <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                            <td colSpan={5} className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-gray-100 text-sm">
                              🔧 Technical & Maintenance
                            </td>
                          </tr>
                          {['Audio/Video Tech', 'Sound Engineering', 'Computer Skills', 'Website Management', 'Maintenance & Repair', 'Electrical Work'].map(skill => (
                            <tr key={skill} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="p-2 border-r dark:border-gray-700">{skill}</td>
                              <td className="p-2 border-r dark:border-gray-700 text-center">
                                <div
                                  onClick={() => handleSkillToggle(skill)}
                                  className={`w-4 h-4 mx-auto rounded cursor-pointer border transition-colors ${
                                    selectedSkills.includes(skill)
                                      ? 'bg-red-500 border-red-500'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-red-400'
                                  }`}
                                />
                              </td>
                              <td className="p-2 border-r dark:border-gray-700 text-center">
                                <div
                                  onClick={() => handleSkillToggle(skill)}
                                  className={`w-4 h-4 mx-auto rounded cursor-pointer border transition-colors ${
                                    preferredSkills.includes(skill)
                                      ? 'bg-blue-500 border-blue-500'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                                  }`}
                                />
                              </td>
                              <td className="p-2 border-r dark:border-gray-700 text-center">
                                {(skill === 'Audio/Video Tech' || skill === 'Sound Engineering' || skill === 'Website Management') && (
                                  <div
                                    onClick={() => handleSpiritualGiftToggle('Serving')}
                                    className={`w-4 h-4 mx-auto rounded cursor-pointer border transition-colors ${
                                      selectedSpiritualGifts.includes('Serving')
                                        ? 'bg-purple-500 border-purple-500'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                                    }`}
                                  />
                                )}
                              </td>
                              <td className="p-2 text-center">
                                <div className="w-4 h-4 mx-auto border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 cursor-not-allowed"></div>
                              </td>
                            </tr>
                          ))}

                          {/* Ministry Skills */}
                          <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                            <td colSpan={5} className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-gray-100 text-sm">
                              ⛪ Ministry & Teaching
                            </td>
                          </tr>
                          {['Teaching', 'Bible Study Leadership', 'Counseling', 'Pastoral Care', 'Youth Ministry', 'Children\'s Ministry', 'Music Ministry', 'Worship Leading', 'Prayer Ministry', 'Evangelism'].map(skill => (
                            <tr key={skill} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="p-2 border-r dark:border-gray-700">{skill}</td>
                              <td className="p-2 border-r dark:border-gray-700 text-center">
                                <div
                                  onClick={() => handleSkillToggle(skill)}
                                  className={`w-4 h-4 mx-auto rounded cursor-pointer border transition-colors ${
                                    selectedSkills.includes(skill)
                                      ? 'bg-red-500 border-red-500'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-red-400'
                                  }`}
                                />
                              </td>
                              <td className="p-2 border-r dark:border-gray-700 text-center">
                                <div
                                  onClick={() => handleSkillToggle(skill)}
                                  className={`w-4 h-4 mx-auto rounded cursor-pointer border transition-colors ${
                                    preferredSkills.includes(skill)
                                      ? 'bg-blue-500 border-blue-500'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                                  }`}
                                />
                              </td>
                              <td className="p-2 border-r dark:border-gray-700 text-center">
                                {['Teaching', 'Bible Study Leadership', 'Evangelism', 'Pastoral Care', 'Prayer Ministry'].includes(skill) && (
                                  <div
                                    onClick={() => handleSpiritualGiftToggle(
                                      skill === 'Bible Study Leadership' ? 'Teaching' : 
                                      skill === 'Pastoral Care' ? 'Shepherding' : 
                                      skill === 'Prayer Ministry' ? 'Intercession' :
                                      skill.split(' ')[0]
                                    )}
                                    className={`w-4 h-4 mx-auto rounded cursor-pointer border transition-colors ${
                                      selectedSpiritualGifts.includes(
                                        skill === 'Bible Study Leadership' ? 'Teaching' : 
                                        skill === 'Pastoral Care' ? 'Shepherding' : 
                                        skill === 'Prayer Ministry' ? 'Intercession' :
                                        skill.split(' ')[0]
                                      )
                                        ? 'bg-purple-500 border-purple-500'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                                    }`}
                                  />
                                )}
                              </td>
                              <td className="p-2 text-center">
                                <div className="w-4 h-4 mx-auto border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 cursor-not-allowed"></div>
                              </td>
                            </tr>
                          ))}

                          {/* Hospitality Skills */}
                          <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                            <td colSpan={5} className="p-2 bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-gray-100 text-sm">
                              🤝 Hospitality & Service
                            </td>
                          </tr>
                          {['Food Service', 'Cooking', 'Hospitality', 'Guest Relations', 'Greeting', 'Ushering', 'Child Care', 'Elder Care'].map(skill => (
                            <tr key={skill} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="p-2 border-r dark:border-gray-700">{skill}</td>
                              <td className="p-2 border-r dark:border-gray-700 text-center">
                                <div
                                  onClick={() => handleSkillToggle(skill)}
                                  className={`w-4 h-4 mx-auto rounded cursor-pointer border transition-colors ${
                                    selectedSkills.includes(skill)
                                      ? 'bg-red-500 border-red-500'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-red-400'
                                  }`}
                                />
                              </td>
                              <td className="p-2 border-r dark:border-gray-700 text-center">
                                <div
                                  onClick={() => handleSkillToggle(skill)}
                                  className={`w-4 h-4 mx-auto rounded cursor-pointer border transition-colors ${
                                    preferredSkills.includes(skill)
                                      ? 'bg-blue-500 border-blue-500'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                                  }`}
                                />
                              </td>
                              <td className="p-2 border-r dark:border-gray-700 text-center">
                                {['Food Service', 'Cooking', 'Hospitality', 'Child Care', 'Elder Care'].includes(skill) && (
                                  <div
                                    onClick={() => handleSpiritualGiftToggle(skill === 'Hospitality' ? 'Hospitality' : skill === 'Child Care' || skill === 'Elder Care' ? 'Mercy' : 'Serving')}
                                    className={`w-4 h-4 mx-auto rounded cursor-pointer border transition-colors ${
                                      selectedSpiritualGifts.includes(skill === 'Hospitality' ? 'Hospitality' : skill === 'Child Care' || skill === 'Elder Care' ? 'Mercy' : 'Serving')
                                        ? 'bg-purple-500 border-purple-500'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                                    }`}
                                  />
                                )}
                              </td>
                              <td className="p-2 text-center">
                                <div className="w-4 h-4 mx-auto border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 cursor-not-allowed"></div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

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
                          <Select onValueChange={field.onChange} value={field.value}>
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                            <Select onValueChange={field.onChange} value={typeof field.value === 'string' ? field.value : field.value?.pattern || 'Weekly'}>
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
