import React, { useState, useRef, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Upload, X, Plus, Building2, Users, Globe, Phone, MapPin, Clock, Camera, Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

// Complete form schema with all fields
const formSchema = z.object({
  name: z.string().min(2, { message: "Community name must be at least 2 characters." }),
  type: z.string().min(1, { message: "Please select a community type." }),
  denomination: z.string().optional(),
  customDenomination: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  website: z.string().url({ message: "Invalid URL." }).optional().or(z.literal('')),
  privacySetting: z.string().default('public'),
  logoUrl: z.string().optional(),
  establishedYear: z.number().optional(),
  weeklyAttendance: z.string().optional(),
  parentChurchName: z.string().optional(),
  missionStatement: z.string().optional(),
  // Social Media Links
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  // Service Times
  officeHours: z.string().optional(),
  worshipTimes: z.string().optional(),
  sundayService: z.string().optional(),
  wednesdayService: z.string().optional(),
  // Custom Times
  customTime1: z.string().optional(),
  customTime1Label: z.string().optional(),
  customTime2: z.string().optional(),
  customTime2Label: z.string().optional(),
  customTime3: z.string().optional(),
  customTime3Label: z.string().optional(),
  // Privacy Settings
  hideAddress: z.boolean().default(false),
  hidePhone: z.boolean().default(false),
});

type CommunityFormValues = z.infer<typeof formSchema>;

// Comprehensive denomination options
const DENOMINATION_OPTIONS = [
  "Baptist", "Methodist", "Presbyterian", "Lutheran", "Episcopal", "Reformed", "Congregational",
  "Catholic", "Orthodox", "Eastern Orthodox", "Greek Orthodox", "Russian Orthodox",
  "Evangelical", "Non-denominational", "Community Church", "Bible Church",
  "Pentecostal", "Assembly of God", "Charismatic", "Four Square Gospel",
  "Anglican", "Episcopalian", "United Church of Christ", "Disciples of Christ",
  "Calvary Chapel", "Vineyard", "Hillsong", "Bethel", "International Church of Christ",
  "Reformed Church in America", "Presbyterian Church (USA)", "Presbyterian Church in America",
  "Southern Baptist", "American Baptist", "Independent Baptist", "Missionary Baptist",
  "Lutheran Church Missouri Synod", "Evangelical Lutheran Church", "Wisconsin Evangelical Lutheran",
  "United Methodist", "Free Methodist", "African Methodist Episcopal", "Wesleyan",
  "Seventh-day Adventist", "Church of Christ", "Christian Reformed", "Mennonite", "Quaker",
  "Unitarian Universalist", "Unity", "Church of God", "Church of the Nazarene", "Salvation Army",
  "Interfaith", "Emerging Church", "House Church", "Multi-denominational", "Other"
];

const MINISTRY_TYPE_OPTIONS = [
  "Children's Ministry", "Youth Ministry", "Young Adults Ministry", "Senior Adults Ministry",
  "Singles Ministry", "Marriage Ministry", "Men's Ministry", "Women's Ministry", "Family Ministry",
  "Worship Ministry", "Music Ministry", "Prayer Ministry", "Discipleship Ministry", "Small Groups",
  "Evangelism Ministry", "Missions Ministry", "Community Outreach", "Food Ministry", "Homeless Ministry",
  "Counseling Ministry", "Recovery Ministry", "Grief Support", "Financial Ministry", "Health Ministry",
  "Bible Study Ministry", "Christian Education", "Vacation Bible School", "Sunday School", "Seminary",
  "Drama Ministry", "Arts Ministry", "Media Ministry", "Creative Writing", "Photography Ministry",
  "Hospitality Ministry", "Facilities Ministry", "Transportation Ministry", "Technology Ministry", "Security Ministry",
  "Multi-Ministry", "Other"
];

const GROUP_TYPE_OPTIONS = [
  "Bible Study", "Prayer Group", "Fellowship Group", "Support Group",
  "Small Group", "Life Group", "Connect Group", "Men's Group", "Women's Group",
  "Youth Group", "Senior Group", "Singles Group", "Couples Group", "Family Group",
  "Recovery Group", "Grief Support Group", "Financial Peace Group", "Other"
];

interface CommunityData {
  id?: number;
  name: string;
  type: string;
  denomination?: string;
  customDenomination?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  privacySetting: string;
  logoUrl?: string;
  establishedYear?: number;
  weeklyAttendance?: string;
  parentChurchName?: string;
  missionStatement?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  };
  officeHours?: string;
  worshipTimes?: string;
  sundayService?: string;
  wednesdayService?: string;
  additionalTimes?: Array<{
    eventLabel: string;
    timeSchedule: string;
    language: string;
  }>;
  hideAddress?: boolean;
  hidePhone?: boolean;
}

interface CommunityFormProps {
  mode: 'create' | 'edit';
  initialData?: CommunityData; // Community data for editing mode
  onSuccess: () => void;
  onCancel: () => void;
}

export function CommunityForm({ mode, initialData, onSuccess, onCancel }: CommunityFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [additionalTimeSlots, setAdditionalTimeSlots] = useState<number>(3);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  } as const;

  const form = useForm<CommunityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "",
      denomination: initialData?.denomination || "",
      customDenomination: initialData?.customDenomination || "",
      description: initialData?.description || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      zipCode: initialData?.zipCode || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      website: initialData?.website || "",
      privacySetting: initialData?.privacySetting || "public",
      logoUrl: initialData?.logoUrl || "",
      establishedYear: initialData?.establishedYear || undefined,
      weeklyAttendance: initialData?.weeklyAttendance || "",
      parentChurchName: initialData?.parentChurchName || "",
      missionStatement: initialData?.missionStatement || "",
      facebookUrl: initialData?.socialLinks?.facebook || "",
      instagramUrl: initialData?.socialLinks?.instagram || "",
      twitterUrl: initialData?.socialLinks?.twitter || "",
      tiktokUrl: initialData?.socialLinks?.tiktok || "",
      youtubeUrl: initialData?.socialLinks?.youtube || "",
      linkedinUrl: initialData?.socialLinks?.linkedin || "",
      officeHours: initialData?.officeHours || "",
      worshipTimes: initialData?.worshipTimes || "",
      sundayService: initialData?.sundayService || "",
      wednesdayService: initialData?.wednesdayService || "",
      customTime1: initialData?.additionalTimes?.[0]?.timeSchedule || "",
      customTime1Label: initialData?.additionalTimes?.[0]?.eventLabel || "",
      customTime2: initialData?.additionalTimes?.[1]?.timeSchedule || "",
      customTime2Label: initialData?.additionalTimes?.[1]?.eventLabel || "",
      customTime3: initialData?.additionalTimes?.[2]?.timeSchedule || "",
      customTime3Label: initialData?.additionalTimes?.[2]?.eventLabel || "",
      hideAddress: initialData?.hideAddress || false,
      hidePhone: initialData?.hidePhone || false,
    },
  });

  const watchedType = form.watch("type");
  const watchedDenomination = form.watch("denomination");

  // Helper function to get denomination options based on community type
  const getDenominationOptions = () => {
    switch (watchedType) {
      case 'church':
        return DENOMINATION_OPTIONS;
      case 'ministry':
        return MINISTRY_TYPE_OPTIONS;
      case 'group':
        return GROUP_TYPE_OPTIONS;
      default:
        return DENOMINATION_OPTIONS;
    }
  };

  // Auto-populate service times when denomination changes (for churches only)
  useEffect(() => {
    if (watchedType === 'church' && watchedDenomination && denominationDefaults[watchedDenomination as keyof typeof denominationDefaults]) {
      const defaults = denominationDefaults[watchedDenomination as keyof typeof denominationDefaults];
      form.setValue("officeHours", defaults.officeHours);
      form.setValue("worshipTimes", defaults.worshipTimes);
    }
  }, [watchedDenomination, watchedType, form]);

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

  const isEditing = mode === 'edit' && !!initialData?.id;

  // Handle form submission with logo upload
  const saveCommunityMutation = useMutation({
    mutationFn: async (values: CommunityFormValues) => {
      let logoUrl = values.logoUrl;
      
      // Upload logo if a new file was selected
      if (logoFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);
        
        const uploadResponse = await fetch('/api/upload/community-logo', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          logoUrl = uploadResult.logoUrl;
        }
      }

      // Prepare data for submission
      const submitData = {
        ...values,
        logoUrl,
        socialLinks: {
          facebook: values.facebookUrl,
          instagram: values.instagramUrl,
          twitter: values.twitterUrl,
          tiktok: values.tiktokUrl,
          youtube: values.youtubeUrl,
          linkedin: values.linkedinUrl,
        },
        additionalTimes: [
          values.customTime1 && values.customTime1Label ? {
            eventLabel: values.customTime1Label,
            timeSchedule: values.customTime1,
            language: "English"
          } : null,
          values.customTime2 && values.customTime2Label ? {
            eventLabel: values.customTime2Label,
            timeSchedule: values.customTime2,
            language: "English"
          } : null,
          values.customTime3 && values.customTime3Label ? {
            eventLabel: values.customTime3Label,
            timeSchedule: values.customTime3,
            language: "English"
          } : null,
        ].filter(Boolean),
      };

      if (isEditing) {
        return await apiRequest("PUT", `/api/users/communities/${initialData.id}`, submitData);
      } else {
        return await apiRequest("POST", "/api/users/communities", submitData);
      }
    },
    onSuccess: () => {
      const message = isEditing ? "Community updated successfully" : "Community created successfully";
      toast({ title: "Success", description: message });
      queryClient.invalidateQueries({ queryKey: ['/api/users/communities'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to save community", variant: "destructive" });
    },
  });

  const onSubmit = (values: CommunityFormValues) => {
    console.log('Submitting comprehensive form with values:', values);
    saveCommunityMutation.mutate(values);
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 text-black dark:text-white">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-gray-800 text-black dark:text-white p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Community Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="First Baptist Church" 
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Community Type *</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("denomination", "");
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-gray-700 text-black dark:text-white">
                            <SelectValue placeholder="Select community type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent 
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg z-[9999]"
                          sideOffset={5}
                        >
                          <SelectItem value="church" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white">
                            Churches
                          </SelectItem>
                          <SelectItem value="ministry" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white">
                            Ministries
                          </SelectItem>
                          <SelectItem value="group" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white">
                            Groups
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedType && (
                  <FormField
                    control={form.control}
                    name="denomination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {watchedType === 'church' ? 'Denomination *' : 
                           watchedType === 'ministry' ? 'Ministry Type *' : 'Group Type *'}
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-gray-700 text-black dark:text-white">
                              <SelectValue placeholder={
                                watchedType === 'church' ? "Select denomination" :
                                watchedType === 'group' ? "Select group type" : "Select ministry type"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent 
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg z-[9999] max-h-60 overflow-y-auto"
                            sideOffset={5}
                          >
                            {getDenominationOptions().map((option) => (
                              <SelectItem key={option} value={option} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white">
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="weeklyAttendance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weekly Attendance</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-gray-700 text-black dark:text-white">
                            <SelectValue placeholder="Select attendance range..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent 
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg z-[9999]"
                          sideOffset={5}
                        >
                          <SelectItem value="Under 50" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white">Under 50</SelectItem>
                          <SelectItem value="50-100" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white">50-100</SelectItem>
                          <SelectItem value="100-200" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white">100-200</SelectItem>
                          <SelectItem value="200-500" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white">200-500</SelectItem>
                          <SelectItem value="500-1000" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white">500-1000</SelectItem>
                          <SelectItem value="1000-2000" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white">1000-2000</SelectItem>
                          <SelectItem value="Over 2000" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white">Over 2000</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedDenomination === 'Other' && (
                  <FormField
                    control={form.control}
                    name="customDenomination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom {watchedType === 'church' ? 'Denomination' : watchedType === 'group' ? 'Group Type' : 'Ministry Type'}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={`Enter custom ${watchedType === 'church' ? 'denomination' : watchedType === 'group' ? 'group type' : 'ministry type'}...`}
                            {...field}
                            className="bg-white dark:bg-gray-700 text-black dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Privacy setting only shows for ministries and groups, not churches */}
                {(watchedType === 'ministry' || watchedType === 'group') && (
                  <FormField
                    control={form.control}
                    name="privacySetting"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Privacy Setting *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-gray-700 text-black dark:text-white">
                              <SelectValue placeholder="Select privacy level..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent 
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg z-[9999]"
                            sideOffset={5}
                          >
                            <SelectItem value="public" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white">🌍 Public - Visible to everyone</SelectItem>
                            <SelectItem value="private" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white">🔒 Private - Invite only</SelectItem>
                            <SelectItem value="church_members_only" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white">⛪ Church Members Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Logo Upload */}
                <div>
                  <FormLabel>Community Logo</FormLabel>
                  <div className="flex items-center gap-4 mt-2">
                    {(logoPreview || form.watch("logoUrl")) && (
                      <div className="relative">
                        <img
                          src={logoPreview || form.watch("logoUrl")}
                          alt="Logo preview"
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => {
                            setLogoPreview('');
                            setLogoFile(null);
                            form.setValue("logoUrl", "");
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Camera className="h-4 w-4" />
                        {logoPreview || form.watch("logoUrl") ? 'Change Logo' : 'Upload Logo'}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="contact@community.org"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(555) 123-4567"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://www.community.org"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123 Main Street"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Anytown"
                            {...field}
                            className="bg-white dark:bg-gray-700 text-black dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="CA"
                            {...field}
                            className="bg-white dark:bg-gray-700 text-black dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="12345"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Service Times */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Service Times
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="worshipTimes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Worship Times</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Sunday 9:00 AM & 11:00 AM"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sundayService"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sunday Service</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="10:00 AM"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wednesdayService"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wednesday Service</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="7:00 PM"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="officeHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office Hours</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Monday-Friday 9:00 AM - 5:00 PM"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Custom Service Times */}
                <div className="space-y-3">
                  <FormLabel>Additional Service Times</FormLabel>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="customTime1Label"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Service Name"
                              {...field}
                              className="bg-white dark:bg-gray-700 text-black dark:text-white"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customTime1"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Time"
                              {...field}
                              className="bg-white dark:bg-gray-700 text-black dark:text-white"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="customTime2Label"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Service Name"
                              {...field}
                              className="bg-white dark:bg-gray-700 text-black dark:text-white"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customTime2"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Time"
                              {...field}
                              className="bg-white dark:bg-gray-700 text-black dark:text-white"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="customTime3Label"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Service Name"
                              {...field}
                              className="bg-white dark:bg-gray-700 text-black dark:text-white"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customTime3"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Time"
                              {...field}
                              className="bg-white dark:bg-gray-700 text-black dark:text-white"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {additionalTimeSlots > 3 && (
                    <>
                      {[4, 5, 6].slice(0, additionalTimeSlots - 3).map((num) => (
                        <div key={num} className="grid grid-cols-2 gap-2">
                          <Input 
                            placeholder="Service Name"
                            className="bg-white dark:bg-gray-700 text-black dark:text-white"
                          />
                          <Input 
                            placeholder="Time"
                            className="bg-white dark:bg-gray-700 text-black dark:text-white"
                          />
                        </div>
                      ))}
                    </>
                  )}

                  {additionalTimeSlots < 6 && (
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setAdditionalTimeSlots(prev => Math.min(prev + 1, 6))}
                      className="flex items-center gap-2 mt-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add more time
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Media Links */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Social Media Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="facebookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://facebook.com/yourcommunity"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagramUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://instagram.com/yourcommunity"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitterUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Twitter className="h-4 w-4" />
                        Twitter/X
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://twitter.com/yourcommunity"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="youtubeUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Youtube className="h-4 w-4" />
                        YouTube
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://youtube.com/yourcommunity"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tiktokUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FaTiktok className="h-4 w-4" />
                        TikTok
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://tiktok.com/@yourcommunity"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://linkedin.com/company/yourcommunity"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your community..."
                        {...field}
                        className="bg-white dark:bg-gray-700 text-black dark:text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="missionStatement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mission Statement</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Our mission is to..."
                        {...field}
                        className="bg-white dark:bg-gray-700 text-black dark:text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="establishedYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Established Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="1985"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weeklyAttendance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weekly Attendance</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="150"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {watchedType === 'ministry' && (
                <FormField
                  control={form.control}
                  name="parentChurchName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Church Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="First Baptist Church"
                          {...field}
                          className="bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Privacy Options */}
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium">Privacy Options</h4>
                
                <FormField
                  control={form.control}
                  name="hideAddress"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Hide Address</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Don't show address publicly
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hidePhone"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Hide Phone Number</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Don't show phone number publicly
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={saveCommunityMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saveCommunityMutation.isPending}
            >
              {saveCommunityMutation.isPending ? "Saving..." : isEditing ? "Update Community" : "Create Community"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}