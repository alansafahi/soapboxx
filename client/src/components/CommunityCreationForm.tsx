import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Upload } from "lucide-react";

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
  youtubeUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  officeHours: z.string().optional(),
  worshipTimes: z.string().optional()
});

type CommunityFormData = z.infer<typeof createCommunitySchema>;

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
    worshipTimes: "Saturday: 5PM Vigil\nSunday: 8AM, 10AM, 12PM\nDaily Mass: Mon-Fri 7AM"
  },
  "Presbyterian": {
    officeHours: "Mon-Thu 9AM-4PM, Fri 9AM-12PM",
    worshipTimes: "Sunday: 10AM Traditional\nWednesday: 7PM Bible Study"
  },
  "Lutheran": {
    officeHours: "Mon-Thu 9AM-4PM",
    worshipTimes: "Sunday: 8AM Traditional, 10:30AM Contemporary\nWednesday: 7PM Study"
  },
  "Episcopal": {
    officeHours: "Mon-Thu 9AM-4PM",
    worshipTimes: "Sunday: 8AM Holy Eucharist, 10AM Holy Eucharist\nWednesday: 12PM Eucharist"
  },
  "Pentecostal": {
    officeHours: "Mon-Fri 9AM-4PM",
    worshipTimes: "Sunday: 10AM & 6PM\nWednesday: 7PM Prayer & Bible Study"
  },
  "Assembly of God": {
    officeHours: "Mon-Fri 9AM-4PM",
    worshipTimes: "Sunday: 10AM & 6PM\nWednesday: 7PM Bible Study"
  },
  "Non-denominational": {
    officeHours: "Mon-Thu 9AM-4PM",
    worshipTimes: "Sunday: 9AM & 11AM\nWednesday: 7PM Bible Study"
  },
  "Evangelical": {
    officeHours: "Mon-Thu 9AM-4PM",
    worshipTimes: "Sunday: 9AM & 11AM\nWednesday: 7PM Bible Study"
  }
};

interface CommunityCreationFormProps {
  onSubmit: (data: CommunityFormData) => void;
  isLoading?: boolean;
  submitButtonText?: string;
  initialData?: Partial<CommunityFormData>;
  mode?: "create" | "edit";
}

export function CommunityCreationForm({ 
  onSubmit, 
  isLoading = false, 
  submitButtonText = "Create Community",
  initialData = {},
  mode = "create"
}: CommunityCreationFormProps) {
  const [showCustomDenomination, setShowCustomDenomination] = useState(false);
  const [selectedType, setSelectedType] = useState(initialData?.type || "church");

  const form = useForm<CommunityFormData>({
    resolver: zodResolver(createCommunitySchema),
    defaultValues: {
      name: "",
      type: "church",
      denomination: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
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
      officeHours: "",
      worshipTimes: "",
      ...initialData
    }
  });

  const handleDenominationChange = (denomination: string) => {
    const defaults = denominationDefaults[denomination as keyof typeof denominationDefaults];
    if (defaults) {
      form.setValue("officeHours", defaults.officeHours);
      form.setValue("worshipTimes", defaults.worshipTimes);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Community Name *</FormLabel>
                <FormControl>
                  <Input placeholder="First Baptist Church" {...field} />
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
                <FormLabel>Type</FormLabel>
                <Select onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedType(value);
                  form.setValue("denomination", "");
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
            control={form.control}
            name="denomination"
            render={({ field }) => {
              const currentAffiliations = AFFILIATIONS[selectedType as keyof typeof AFFILIATIONS] || AFFILIATIONS.church;
              
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
                      if (selectedType === 'church') {
                        handleDenominationChange(value);
                      }
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
            control={form.control}
            name="establishedYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Established Year</FormLabel>
                <FormControl>
                  <Input placeholder="2020" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Location Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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

            <FormField
              control={form.control}
              name="weeklyAttendance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weekly Attendance</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select attendance size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="micro">Micro Church (1-15 people)</SelectItem>
                      <SelectItem value="house">House Church (16-35 people)</SelectItem>
                      <SelectItem value="small">Small Church (36-100 people)</SelectItem>
                      <SelectItem value="medium">Medium Church (101-350 people)</SelectItem>
                      <SelectItem value="large">Large Church (351-999 people)</SelectItem>
                      <SelectItem value="mega">Mega Church (1,000-4,999 people)</SelectItem>
                      <SelectItem value="giga">Giga Church (5,000-9,999 people)</SelectItem>
                      <SelectItem value="meta">Meta Church (10,000+ people)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Community Logo */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Community Logo
          </h3>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Upload a logo</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG up to 5MB</p>
              </div>
              <input id="logo-upload" type="file" className="hidden" accept="image/*" />
            </label>
          </div>
        </div>

        {/* About Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            About Your Community
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about your community..."
                      className="min-h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
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
              control={form.control}
              name="missionStatement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mission Statement</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Our mission is to..."
                      className="min-h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Social Media Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Social Media
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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

            <FormField
              control={form.control}
              name="youtubeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/@community" {...field} />
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
                  <FormLabel>LinkedIn URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/company/community" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Service Times */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Service Times
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="officeHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Office Hours (Auto-filled by denomination)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mon-Fri 9AM-4PM"
                      className="min-h-16"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="worshipTimes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Worship Times (Auto-filled by denomination)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Sunday: 9AM & 11AM"
                      className="min-h-16"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Processing..." : submitButtonText}
        </Button>
      </form>
    </Form>
  );
}