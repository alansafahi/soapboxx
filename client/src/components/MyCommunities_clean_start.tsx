import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Building, MapPin, Users, Calendar, Plus, Settings, Eye, Upload, X, Trash2 } from "lucide-react";
import { CommunityViewDialog } from "./CommunityViewDialog";
import { CommunityForm } from "./CommunityForm";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
import { z } from "zod";

interface Community {
  id: number;
  name: string;
  type: string; // church, group, ministry
  denomination: string;
  address: string;
  city: string;
  state: string;
  memberCount: number;
  role: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  phone?: string;
}

// Community creation schema
const createCommunitySchema = z.object({
  name: z.string().min(1, "Community name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  type: z.string().default("church"),
  denomination: z.string().optional(),
  privacySetting: z.enum(["public", "private", "church_members_only"]).default("public"),
  adminEmail: z.string().email("Valid email required"),
  adminPhone: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  establishedYear: z.string().optional(),
  weeklyAttendance: z.string().optional(),
  parentChurchName: z.string().optional(),
  missionStatement: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  officeHours: z.string().optional(),
  worshipTimes: z.string().optional(),
  hideAddress: z.boolean().optional(),
  hidePhone: z.boolean().optional()
});

// Organization-specific affiliation lists
const AFFILIATIONS = {
  church: [
    "Baptist", "Methodist", "Presbyterian", "Lutheran", "Episcopal", "Catholic", "Orthodox",
    "Pentecostal", "Assembly of God", "Church of Christ", "Disciples of Christ", "Adventist",
    "Mennonite", "Quaker", "Congregational", "Reformed", "Evangelical", "Non-denominational",
    "Interdenominational", "Unity", "Unitarian Universalist"
  ],
  group: [
    "Community Organization", "Non-Profit", "Educational", "Support Group", "Recovery Group",
    "Parent Group", "Youth Organization", "Senior Group", "Health & Wellness", "Environmental",
    "Cultural Organization", "Arts & Music", "Sports & Recreation", "Professional Association",
    "Volunteer Group", "Advocacy Group", "Religious Study Group", "Social Club"
  ],
  ministry: [
    "Youth Ministry", "Children's Ministry", "Young Adults Ministry", "Senior Ministry", 
    "Women's Ministry", "Men's Ministry", "Music Ministry", "Worship Ministry", "Prayer Ministry",
    "Outreach Ministry", "Missions Ministry", "Education Ministry", "Pastoral Care Ministry",
    "Community Service Ministry", "Recovery Ministry", "Family Ministry", "Singles Ministry",
    "Small Groups Ministry", "Discipleship Ministry", "Evangelism Ministry"
  ]
};

// Denomination-based defaults for operating hours
const denominationDefaults = {
  "Baptist": {
    officeHours: "Mon-Thu 9AM-4PM, Fri 9AM-12PM",
    worshipTimes: "Sunday: 9AM & 11AM\nWednesday: 6:30PM Bible Study"
  },
  "Methodist": {
    officeHours: "Mon-Thu 9AM-4PM, Fri 9AM-12PM",
    worshipTimes: "Sunday: 9AM Traditional, 11AM Contemporary\nWednesday: 6:30PM Study"
  },
  "Catholic": {
    officeHours: "Mon-Fri 9AM-4PM",
    worshipTimes: "Saturday: 5PM Vigil Mass\nSunday: 8AM, 10AM, 12PM Mass\nDaily Mass: Mon-Fri 8AM"
  },
  "Presbyterian": {
    officeHours: "Mon-Thu 9AM-4PM, Fri 9AM-1PM",
    worshipTimes: "Sunday: 9AM Sunday School, 10AM Worship\nWednesday: 7PM Prayer Meeting"
  },
  "Pentecostal": {
    officeHours: "Mon-Thu 10AM-4PM, Fri 10AM-12PM",
    worshipTimes: "Sunday: 10AM & 6PM\nWednesday: 7PM Bible Study\nFriday: 7PM Prayer Night"
  },
  "Lutheran": {
    officeHours: "Mon-Thu 9AM-3PM, Fri 9AM-12PM",
    worshipTimes: "Sunday: 8:30AM Traditional, 10:30AM Contemporary\nWednesday: 7PM Study"
  },
  "Episcopal": {
    officeHours: "Mon-Thu 9AM-4PM",
    worshipTimes: "Sunday: 8AM Holy Eucharist, 10AM Family Service\nWednesday: 12PM Holy Eucharist"
  },
  "Non-denominational": {
    officeHours: "Mon-Fri 9AM-4PM",
    worshipTimes: "Sunday: 9AM & 11AM Services\nWednesday: 7PM Bible Study"
  }
};

// Weekly attendance categories
const WEEKLY_ATTENDANCE_OPTIONS = [
  { value: "under-50", label: "Micro (Under 50)" },
  { value: "50-99", label: "Small (50-99)" },
  { value: "100-199", label: "Medium (100-199)" },
  { value: "200-349", label: "Large (200-349)" },
  { value: "350-499", label: "Very Large (350-499)" },
  { value: "500-999", label: "Mega (500-999)" },
  { value: "1000-4999", label: "Super Mega (1,000-4,999)" },
  { value: "5000+", label: "Meta Church (5,000+)" }
];

// Language options
const LANGUAGE_OPTIONS = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "italian", label: "Italian" },
  { value: "portuguese", label: "Portuguese" },
  { value: "chinese", label: "Chinese" },
  { value: "korean", label: "Korean" },
  { value: "japanese", label: "Japanese" },
  { value: "arabic", label: "Arabic" },
  { value: "hindi", label: "Hindi" },
  { value: "russian", label: "Russian" },
  { value: "other", label: "Other" }
];

export default function MyCommunities() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Handle community deletion
  const deleteCommunityMutation = useMutation({
    mutationFn: async (communityId: number) => {
      const response = await fetch(`/api/communities/${communityId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete community');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Community Deleted",
        description: "The community has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/communities/user'] });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete community",
        variant: "destructive",
      });
    },
  });

  const handleDeleteCommunity = (communityId: number) => {
    if (window.confirm('Are you sure you want to delete this community? This action cannot be undone.')) {
      deleteCommunityMutation.mutate(communityId);
    }
  };
  const [createCommunityOpen, setCreateCommunityOpen] = useState(false);
  const [showCustomDenomination, setShowCustomDenomination] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [timeRows, setTimeRows] = useState([
    { id: 1, eventLabel: '', timeSchedule: '', language: 'english' }
  ]);
  
  const { data: userCommunities = [], isLoading, error } = useQuery<Community[]>({
    queryKey: ["/api/users/communities"],
    enabled: !!user,
  });

  // Create community form
  const createForm = useForm({
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      type: "church",
      denomination: "",
      privacySetting: "public",
      adminEmail: "",
      adminPhone: "",
      website: "",
      description: "",
      logoUrl: "",
      establishedYear: "",
      weeklyAttendance: "",
      parentChurchName: "",
      missionStatement: "",
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      tiktokUrl: "",
      youtubeUrl: "",
      linkedinUrl: "",
      sundayService: "",
      wednesdayService: "",
      officeHours: "",
      worshipTimes: "",
      language: "english",
      customTime1: "",
      customTime1Label: "",
      customTime2: "",
      customTime2Label: "",
      customTime3: "",
      customTime3Label: "",
      customTime4: "",
      customTime4Label: ""
    }
  });

  // Watch the type field to update affiliation options
  const selectedType = createForm.watch("type") as keyof typeof AFFILIATIONS;
  const selectedDenomination = createForm.watch("denomination");

  // Auto-fill office hours and worship times based on denomination selection
  useEffect(() => {
    if (selectedDenomination && denominationDefaults[selectedDenomination as keyof typeof denominationDefaults]) {
      const defaults = denominationDefaults[selectedDenomination as keyof typeof denominationDefaults];
      createForm.setValue('officeHours', defaults.officeHours);
      createForm.setValue('worshipTimes', defaults.worshipTimes);
    }
  }, [selectedDenomination, createForm]);

  // Handle logo upload
  const handleLogoUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await fetch('/api/upload/community-logo', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload logo');
    }
    
    const result = await response.json();
    return result.logoUrl;
  };

  // Handle logo file selection
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper function to normalize website URL
  const normalizeWebsiteUrl = (url: string) => {
    if (!url?.trim()) return "";
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
      return trimmedUrl;
    }
    return `https://${trimmedUrl}`;
  };

  // SoapBox Development Standards v1.0 Field Mapping: camelCase -> snake_case
  const transformToSnakeCase = (data: any) => {
    const fieldMapping = {
      adminEmail: 'admin_email',
      adminPhone: 'admin_phone',
      zipCode: 'zip_code',
      logoUrl: 'logo_url',
      privacySetting: 'privacy_setting'
      // Only mapping fields that exist in actual database schema
    };

    const transformed = { ...data };
    
    // Transform field names according to standards
    Object.keys(fieldMapping).forEach(camelKey => {
      const snakeKey = fieldMapping[camelKey as keyof typeof fieldMapping];
      if (transformed[camelKey] !== undefined) {
        transformed[snakeKey] = transformed[camelKey];
        delete transformed[camelKey];
      }
    });

    return transformed;
  };

  // Helper functions for managing time rows
  const addTimeRow = () => {
    if (timeRows.length < 6) {
      const newId = Math.max(...timeRows.map(row => row.id)) + 1;
      setTimeRows([...timeRows, { id: newId, eventLabel: '', timeSchedule: '', language: 'english' }]);
    }
  };

  const removeTimeRow = (id: number) => {
    if (timeRows.length > 1) {
      setTimeRows(timeRows.filter(row => row.id !== id));
    }
  };

  const updateTimeRow = (id: number, field: string, value: string) => {
    setTimeRows(timeRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  // Create community mutation
  const createCommunityMutation = useMutation({
    mutationFn: async (data: any) => {
      // Include time rows data as array for backend processing
      const filteredTimeRows = timeRows.filter(row => 
        row.eventLabel.trim() || row.timeSchedule.trim()
      );

      const submissionData = {
        ...data,
        website: normalizeWebsiteUrl(data.website),
        timeRows: filteredTimeRows
      };

      const normalizedData = transformToSnakeCase(submissionData);
      
      // Create FormData for multipart request (to handle logo upload)
      const formData = new FormData();
      
      // Add logo file if selected
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      
      // Add all other fields
      Object.keys(normalizedData).forEach(key => {
        const value = normalizedData[key];
        if (value !== null && value !== undefined) {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
      
      const response = await fetch("/api/communities", {
        method: "POST",
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get('content-type');
        
        try {
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            const errorText = await response.text();
            errorData = { message: errorText };
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          errorData = { message: `Server error (${response.status})` };
        }
        
        console.log('Full error data:', errorData);
        
        // Handle validation errors with detailed messages
        if (errorData.details && Array.isArray(errorData.details)) {
          throw new Error(errorData.message || errorData.details.join('\n• '));
        } else if (errorData.message) {
          throw new Error(errorData.message);
        } else {
          throw new Error(`Failed to create community (${response.status})`);
        }
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Community created successfully!",
        description: "Your new community has been created and you are now the administrator.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users/communities"] });
      setCreateCommunityOpen(false);
      createForm.reset();
      setShowCustomDenomination(false);
      setLogoFile(null);
      setLogoPreview("");
      setTimeRows([{ id: 1, eventLabel: '', timeSchedule: '', language: 'english' }]);
    },
    onError: (error: any) => {
      console.error('Community creation error:', error);
      toast({
        title: "Failed to create community",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Communities</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Communities</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Unable to load communities
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                There was an issue loading your communities. Please try again later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'church_admin':
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'pastor':
      case 'lead-pastor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'elder':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').replace('-', ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Communities</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Communities you're part of and your roles
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={createCommunityOpen} onOpenChange={setCreateCommunityOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create A Community
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create A New Community</DialogTitle>
                <DialogDescription>
                  Set up a new community and become its administrator
                </DialogDescription>
              </DialogHeader>
              
