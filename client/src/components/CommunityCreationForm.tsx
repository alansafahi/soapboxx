import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Upload, Plus, X } from "lucide-react";

// Community creation schema
export const createCommunitySchema = z.object({
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

export type CommunityFormData = z.infer<typeof createCommunitySchema>;

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
  const [timeRows, setTimeRows] = useState([
    { id: 1, eventLabel: '', timeSchedule: '', language: 'english' }
  ]);

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

  // Handle dynamic time rows
  const addTimeRow = () => {
    const newId = Math.max(...timeRows.map(row => row.id)) + 1;
    setTimeRows([...timeRows, { id: newId, eventLabel: '', timeSchedule: '', language: 'english' }]);
  };

  const removeTimeRow = (id: number) => {
    setTimeRows(timeRows.filter(row => row.id !== id));
  };

  const updateTimeRow = (id: number, field: string, value: string) => {
    setTimeRows(timeRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleDenominationChange = (denomination: string) => {
    const defaults = denominationDefaults[denomination as keyof typeof denominationDefaults];
    if (defaults) {
      form.setValue("officeHours", defaults.officeHours);
      form.setValue("worshipTimes", defaults.worshipTimes);
    }
  };

  const handleFormSubmit = (data: CommunityFormData) => {
    // Validate required fields
    if (!data.denomination || data.denomination.trim() === '') {
      return;
    }
    if (!data.weeklyAttendance || data.weeklyAttendance.trim() === '') {
      return;
    }
    
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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

          {/* Service Times Section */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Service Times
            </h3>
          </div>

          <FormField
            control={form.control}
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
            control={form.control}
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
