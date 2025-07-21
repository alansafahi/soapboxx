import React, { useState } from 'react';
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

// Form validation schema matching the screenshots
const createPositionSchema = z.object({
  title: z.string().min(1, 'Position title is required'),
  ministry: z.string().min(1, 'Ministry selection is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  timeCommitment: z.string().min(1, 'Time commitment is required'),
  location: z.string().min(1, 'Location is required'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  backgroundCheckRequired: z.boolean(),
  requiredSkills: z.array(z.string()),
  volunteersNeeded: z.number().min(1).max(50),
  isRecurring: z.boolean(),
  recurringPattern: z.string().optional()
});

type CreatePositionForm = z.infer<typeof createPositionSchema>;

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
  'Senior Ministry'
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

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

export default function VolunteerPositionCreator() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreatePositionForm>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: {
      title: '',
      ministry: '',
      priority: 'medium',
      description: '',
      timeCommitment: '',
      location: '',
      backgroundCheckRequired: false,
      requiredSkills: [],
      volunteersNeeded: 1,
      isRecurring: false,
      recurringPattern: ''
    }
  });

  const createPositionMutation = useMutation({
    mutationFn: async (data: CreatePositionForm) => {
      return apiRequest('/api/volunteer/opportunities', 'POST', {
        ...data,
        requiredSkills: selectedSkills,
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString()
      });
    },
    onSuccess: () => {
      toast({
        title: "Position Created Successfully",
        description: "Your volunteer opportunity has been posted and is now available for applications.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/volunteer/opportunities'] });
      setIsOpen(false);
      form.reset();
      setSelectedSkills([]);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Position",
        description: error.message || "An error occurred while creating the volunteer position.",
        variant: "destructive"
      });
    }
  });

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
    form.setValue('requiredSkills', selectedSkills);
  };

  const onSubmit = (data: CreatePositionForm) => {
    createPositionMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Volunteer Position
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Create New Volunteer Position
          </DialogTitle>
          <DialogDescription>
            Create a detailed volunteer opportunity for your ministry team
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Children Ministry Leader" {...field} />
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
                    <FormLabel>Ministry</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ministry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ministryOptions.map(ministry => (
                          <SelectItem key={ministry} value={ministry}>
                            {ministry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">
                        <Badge className={priorityColors.low}>Low</Badge>
                      </SelectItem>
                      <SelectItem value="medium">
                        <Badge className={priorityColors.medium}>Medium</Badge>
                      </SelectItem>
                      <SelectItem value="high">
                        <Badge className={priorityColors.high}>High</Badge>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <Badge className={priorityColors.urgent}>Urgent</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Lead Sunday school classes for ages 5-10. Create engaging lessons and activities that help children learn about faith in age-appropriate ways. Background check required for child safety."
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time & Location */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timeCommitment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Time Commitment
                    </FormLabel>
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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Location
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Church Building">Church Building</SelectItem>
                        <SelectItem value="Children Building">Children Building</SelectItem>
                        <SelectItem value="Youth Room">Youth Room</SelectItem>
                        <SelectItem value="Fellowship Hall">Fellowship Hall</SelectItem>
                        <SelectItem value="Sanctuary">Sanctuary</SelectItem>
                        <SelectItem value="Kitchen">Kitchen</SelectItem>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="Off-site">Off-site</SelectItem>
                        <SelectItem value="Remote/Online">Remote/Online</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Start & End Dates */}
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
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Immediate start</span>
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
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Ongoing</span>
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Requirements */}
            <div className="space-y-4">
              <h4 className="font-semibold">Requirements</h4>
              
              {/* Background Check */}
              <FormField
                control={form.control}
                name="backgroundCheckRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-600" />
                        Background Check Required
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Required for positions involving children or sensitive areas
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {/* Required Skills */}
              <div>
                <FormLabel className="text-sm font-medium">Required Skills</FormLabel>
                <div className="grid grid-cols-3 gap-2 mt-2 max-h-32 overflow-y-auto border rounded-md p-3">
                  {skillOptions.map(skill => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill}
                        checked={selectedSkills.includes(skill)}
                        onCheckedChange={() => handleSkillToggle(skill)}
                      />
                      <label htmlFor={skill} className="text-xs cursor-pointer">
                        {skill}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedSkills.map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                        <button 
                          type="button"
                          onClick={() => handleSkillToggle(skill)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Volunteer Capacity */}
            <FormField
              control={form.control}
              name="volunteersNeeded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Volunteers Needed
                  </FormLabel>
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

            {/* Recurring Options */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>This is a recurring opportunity</FormLabel>
                  </FormItem>
                )}
              />

              {form.watch('isRecurring') && (
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
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createPositionMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {createPositionMutation.isPending ? (
                  <>Creating Position...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create Position
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}