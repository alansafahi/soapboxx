import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Building, MapPin, Users, Calendar, Plus, Settings, Eye, Upload, X } from "lucide-react";
import { CommunityViewDialog } from "./CommunityViewDialog";
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
  officeHours: z.string().optional(),
  worshipTimes: z.string().optional()
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

  // Helper function to transform field names from camelCase to snake_case
  const transformToSnakeCase = (data: any) => {
    const fieldMapping = {
      adminEmail: 'admin_email',
      adminPhone: 'admin_phone',
      zipCode: 'zip_code',
      logoUrl: 'logo_url',
      weeklyAttendance: 'weekly_attendance',
      parentChurchName: 'parent_church_name',
      missionStatement: 'mission_statement',
      facebookUrl: 'facebook_url',
      instagramUrl: 'instagram_url',
      twitterUrl: 'twitter_url',
      tiktokUrl: 'tiktok_url',
      sundayService: 'sunday_service',
      wednesdayService: 'wednesday_service',
      officeHours: 'office_hours',
      worshipTimes: 'worship_times',
      language: 'primaryLanguage',
      customTime1Label: 'custom_time_1_label',
      customTime1: 'custom_time_1',
      customTime2Label: 'custom_time_2_label',
      customTime2: 'custom_time_2',
      customTime3Label: 'custom_time_3_label',
      customTime3: 'custom_time_3',
      customTime4Label: 'custom_time_4_label',
      customTime4: 'custom_time_4'
    };

    const transformed = { ...data };
    
    // Transform field names
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create community");
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create A New Community</DialogTitle>
                <DialogDescription>
                  Set up a new community and become its administrator
                </DialogDescription>
              </DialogHeader>
              
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit((data) => {
                  // Validate required fields
                  if (!data.denomination || data.denomination.trim() === '') {
                    toast({
                      title: "Validation Error",
                      description: "Please select a denomination or affiliation.",
                      variant: "destructive",
                    });
                    return;
                  }
                  if (!data.weeklyAttendance || data.weeklyAttendance.trim() === '') {
                    toast({
                      title: "Validation Error", 
                      description: "Please select weekly attendance.",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  createCommunityMutation.mutate(data);
                })} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Community Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="First Baptist Church" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            createForm.setValue("denomination", "");
                            setShowCustomDenomination(false);
                          }} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="church">Church</SelectItem>
                              <SelectItem value="ministry">Ministry</SelectItem>
                              <SelectItem value="group">Group</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="denomination"
                      render={({ field }) => {
                        const currentAffiliations = AFFILIATIONS[selectedType] || AFFILIATIONS.church;
                        
                        return (
                          <FormItem>
                            <FormLabel>
                              {selectedType === 'church' ? 'Denomination *' : 'Affiliation *'}
                            </FormLabel>
                            <Select onValueChange={(value) => {
                              if (value === "other") {
                                setShowCustomDenomination(true);
                                field.onChange("");
                              } else {
                                setShowCustomDenomination(false);
                                field.onChange(value);
                              }
                            }} value={showCustomDenomination ? "other" : field.value || ""}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={
                                    selectedType === 'church' 
                                      ? "Select denomination or type..."
                                      : selectedType === 'group'
                                      ? "Select group type or type..."
                                      : "Select ministry type or type..."
                                  } />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-60 overflow-y-auto">
                                {currentAffiliations.map((affiliation) => (
                                  <SelectItem key={affiliation} value={affiliation}>
                                    {affiliation}
                                  </SelectItem>
                                ))}
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            {showCustomDenomination && (
                              <FormControl>
                                <Input
                                  placeholder={
                                    selectedType === 'church' 
                                      ? "Enter custom denomination..."
                                      : selectedType === 'group'
                                      ? "Enter custom group type..."
                                      : "Enter custom ministry type..."
                                  }
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  className="mt-2"
                                />
                              </FormControl>
                            )}
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={createForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main Street" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Los Angeles" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <FormControl>
                            <Input placeholder="CA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="90210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="adminEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="pastor@church.org" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="adminPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://www.church.org" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Logo Upload Section */}
                    <div className="col-span-2">
                      <FormLabel>📸 Community Logo</FormLabel>
                      <div className="mt-2 space-y-3">
                        {logoPreview ? (
                          <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                            <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setLogoFile(null);
                                setLogoPreview("");
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <div className="text-center">
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="mt-4">
                                <label htmlFor="logo-upload" className="cursor-pointer">
                                  <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                                    Upload a logo
                                  </span>
                                  <span className="text-sm text-gray-500">PNG, JPG up to 5MB</span>
                                </label>
                                <input
                                  id="logo-upload"
                                  name="logo-upload"
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={handleLogoChange}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <FormField
                      control={createForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your community..."
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="establishedYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Established Year</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="2020" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="weeklyAttendance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>👥 Weekly Attendance *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select attendance size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {WEEKLY_ATTENDANCE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="parentChurchName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Church (if applicable)</FormLabel>
                          <FormControl>
                            <Input placeholder="Main Campus Church Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="missionStatement"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Mission Statement</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Our mission is to..."
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Social Media Section */}
                    <div className="col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                        Social Media
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="facebookUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Facebook URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://facebook.com/community" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createForm.control}
                          name="instagramUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instagram URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://instagram.com/community" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createForm.control}
                          name="twitterUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Twitter (X) URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://x.com/community" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createForm.control}
                          name="tiktokUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>TikTok URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://tiktok.com/@community" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>



                    {/* Service Times Section */}
                    <div className="col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                        Service Times
                      </h3>
                    </div>

                    <FormField
                      control={createForm.control}
                      name="officeHours"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>🕒 Office Hours (Auto-filled by denomination)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Mon-Fri 9AM-4PM"
                              rows={2}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="worshipTimes"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>⛪ Worship Times (Auto-filled by denomination)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Sunday: 9AM & 11AM"
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Dynamic Service Times Section */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-lg font-semibold">Additional Times</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {timeRows.map((row, index) => (
                          <div key={row.id} className="grid grid-cols-12 gap-3 items-end">
                            {/* Event/Time Label */}
                            <div className="col-span-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Event/Time Label
                              </label>
                              <Input
                                placeholder="e.g., Sunday Service, Youth Group"
                                value={row.eventLabel}
                                onChange={(e) => updateTimeRow(row.id, 'eventLabel', e.target.value)}
                              />
                            </div>
                            
                            {/* Time/Schedule */}
                            <div className="col-span-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Time/Schedule
                              </label>
                              <Input
                                placeholder="e.g., Sunday 10:00 AM"
                                value={row.timeSchedule}
                                onChange={(e) => updateTimeRow(row.id, 'timeSchedule', e.target.value)}
                              />
                            </div>
                            
                            {/* Language */}
                            <div className="col-span-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Language
                              </label>
                              <Select 
                                value={row.language} 
                                onValueChange={(value) => updateTimeRow(row.id, 'language', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {LANGUAGE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Remove Button */}
                            <div className="col-span-1">
                              {timeRows.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeTimeRow(row.id)}
                                  className="h-9 w-9 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Add Another Row Button */}
                        {timeRows.length < 6 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addTimeRow}
                            className="w-full mt-3"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another Date/Time
                          </Button>
                        )}
                      </div>
                    </div>

                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setCreateCommunityOpen(false);
                        createForm.reset();
                        setShowCustomDenomination(false);
                        setLogoFile(null);
                        setLogoPreview("");
                        setTimeRows([{ id: 1, eventLabel: '', timeSchedule: '', language: 'english' }]);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createCommunityMutation.isPending}>
                      {createCommunityMutation.isPending ? "Creating..." : "Create Community"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {userCommunities.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Building className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Communities Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                You haven't joined any communities yet. Discover and connect with faith communities in your area.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => {
                    // Scroll to the community discovery section
                    const discoverySection = document.querySelector('#community-discovery');
                    if (discoverySection) {
                      discoverySection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Join a Community
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Churches Section */}
          {userCommunities.filter(c => c.type === 'church').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Churches</h3>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {userCommunities.filter(c => c.type === 'church').length}
                </Badge>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userCommunities.filter(c => c.type === 'church').map((community) => (
                  <Card key={community.id} className="hover:shadow-lg transition-shadow border-2 border-blue-200 dark:border-blue-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {community.logoUrl ? (
                            <img 
                              src={community.logoUrl} 
                              alt={`${community.name} logo`}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                              <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg leading-6 truncate">
                              {community.name}
                            </CardTitle>
                            <CardDescription>
                              {community.denomination}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getRoleBadgeColor(community.role)}>
                          {formatRole(community.role)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {community.city}, {community.state}
                          </span>
                        </div>
                        {community.memberCount && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>{community.memberCount} members</span>
                          </div>
                        )}
                      </div>
                      
                      {community.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {community.description}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedCommunityId(community.id.toString());
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {(community.role === 'church_admin' || community.role === 'admin' || community.role === 'pastor' || community.role === 'lead-pastor' || community.role === 'elder') && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              window.location.href = `/admin?tab=community-admin&communityId=${community.id}`;
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Groups Section */}
          {userCommunities.filter(c => c.type === 'group').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Groups</h3>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {userCommunities.filter(c => c.type === 'group').length}
                </Badge>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userCommunities.filter(c => c.type === 'group').map((community) => (
                  <Card key={community.id} className="hover:shadow-lg transition-shadow border-2 border-green-200 dark:border-green-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {community.logoUrl ? (
                            <img 
                              src={community.logoUrl} 
                              alt={`${community.name} logo`}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                              <Building className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg leading-6 truncate">
                              {community.name}
                            </CardTitle>
                            <CardDescription>
                              {community.denomination}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getRoleBadgeColor(community.role)}>
                          {formatRole(community.role)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {community.city}, {community.state}
                          </span>
                        </div>
                        {community.memberCount && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>{community.memberCount} members</span>
                          </div>
                        )}
                      </div>
                      
                      {community.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {community.description}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Link href={`/community-management/${community.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Calendar className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        {(community.role === 'church_admin' || community.role === 'admin' || community.role === 'pastor') && (
                          <Link href={`/admin?communityId=${community.id}`}>
                            <Button size="sm" variant="outline">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Ministries Section */}
          {userCommunities.filter(c => c.type === 'ministry').length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ministries</h3>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {userCommunities.filter(c => c.type === 'ministry').length}
                </Badge>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userCommunities.filter(c => c.type === 'ministry').map((community) => (
                  <Card key={community.id} className="hover:shadow-lg transition-shadow border-2 border-purple-200 dark:border-purple-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {community.logoUrl ? (
                            <img 
                              src={community.logoUrl} 
                              alt={`${community.name} logo`}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                              <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg leading-6 truncate">
                              {community.name}
                            </CardTitle>
                            <CardDescription>
                              {community.denomination}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getRoleBadgeColor(community.role)}>
                          {formatRole(community.role)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {community.city}, {community.state}
                          </span>
                        </div>
                        {community.memberCount && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>{community.memberCount} members</span>
                          </div>
                        )}
                      </div>
                      
                      {community.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {community.description}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedCommunityId(community.id.toString());
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {(community.role === 'church_admin' || community.role === 'admin' || community.role === 'pastor' || community.role === 'lead-pastor' || community.role === 'elder') && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              window.location.href = `/admin?tab=community-admin&communityId=${community.id}`;
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Community View Dialog */}
      {selectedCommunityId && (
        <CommunityViewDialog
          isOpen={viewDialogOpen}
          onClose={() => {
            setViewDialogOpen(false);
            setSelectedCommunityId(null);
          }}
          communityId={selectedCommunityId}
          userRole={userCommunities.find(c => c.id.toString() === selectedCommunityId)?.role}
        />
      )}
    </div>
  );
}