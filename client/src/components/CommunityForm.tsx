import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Building2, MapPin, Phone, Mail, Globe, Clock, Share2, Image, Upload } from "lucide-react";

interface CommunityFormData {
  id?: number;
  name: string;
  type: string;
  denomination: string;
  customDenomination?: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  website?: string;
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
  additionalTimes?: Array<{
    eventLabel: string;
    timeSchedule: string;
    language: string;
  }>;
}

interface CommunityFormProps {
  mode: "create" | "edit";
  initialData?: Partial<CommunityFormData>;
  onSubmit: (data: CommunityFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitButtonText?: string;
}

const DENOMINATION_OPTIONS = [
  // Traditional Protestant
  "Baptist", "Methodist", "Presbyterian", "Lutheran", "Episcopal", "Reformed", "Congregational",
  // Catholic & Orthodox
  "Catholic", "Orthodox", "Eastern Orthodox", "Greek Orthodox", "Russian Orthodox",
  // Evangelical
  "Evangelical", "Non-denominational", "Community Church", "Bible Church",
  // Charismatic/Pentecostal
  "Pentecostal", "Assembly of God", "Charismatic", "Four Square Gospel",
  // Historic Churches
  "Anglican", "Episcopalian", "United Church of Christ", "Disciples of Christ",
  // Modern Movements
  "Calvary Chapel", "Vineyard", "Hillsong", "Bethel", "International Church of Christ",
  // Reformed Traditions
  "Reformed Church in America", "Presbyterian Church (USA)", "Presbyterian Church in America",
  // Baptist Varieties
  "Southern Baptist", "American Baptist", "Independent Baptist", "Missionary Baptist",
  // Lutheran Varieties
  "Lutheran Church Missouri Synod", "Evangelical Lutheran Church", "Wisconsin Evangelical Lutheran",
  // Methodist Varieties
  "United Methodist", "Free Methodist", "African Methodist Episcopal", "Wesleyan",
  // Other Significant Groups
  "Seventh-day Adventist", "Church of Christ", "Christian Reformed", "Mennonite", "Quaker",
  "Unitarian Universalist", "Unity", "Church of God", "Church of the Nazarene", "Salvation Army",
  // Interfaith/Other
  "Interfaith", "Emerging Church", "House Church", "Multi-denominational", "Other"
];

const WEEKLY_ATTENDANCE_OPTIONS = [
  { value: "micro", label: "Micro (1-10 people)" },
  { value: "small", label: "Small (11-50 people)" },
  { value: "medium", label: "Medium (51-200 people)" },
  { value: "large", label: "Large (201-500 people)" },
  { value: "mega", label: "Mega (501-2000 people)" },
  { value: "giga", label: "Giga (2001-10000 people)" },
  { value: "tera", label: "Tera (10001-50000 people)" },
  { value: "meta", label: "Meta (50000+ people)" }
];

export function CommunityForm({ 
  mode, 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  submitButtonText = mode === "create" ? "Create Community" : "Save Changes"
}: CommunityFormProps) {
  const [formData, setFormData] = useState<CommunityFormData>(() => {
    // Map database fields to form fields
    const mappedData = {
      name: initialData?.name || "",
      type: initialData?.type || "",
      denomination: initialData?.denomination || "",
      description: initialData?.description || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      zipCode: initialData?.zipCode || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      website: initialData?.website || "",
      logoUrl: initialData?.logoUrl || "",
      establishedYear: initialData?.establishedYear || undefined,
      weeklyAttendance: (initialData as any)?.size || initialData?.weeklyAttendance || "", // Map size to weeklyAttendance
      parentChurchName: initialData?.parentChurchName || "",
      missionStatement: (initialData as any)?.bio || initialData?.missionStatement || "", // Map bio to missionStatement
      socialLinks: {
        facebook: initialData?.socialLinks?.facebook || "",
        instagram: initialData?.socialLinks?.instagram || "",
        twitter: initialData?.socialLinks?.twitter || "",
        tiktok: initialData?.socialLinks?.tiktok || "",
        youtube: initialData?.socialLinks?.youtube || "",
        linkedin: initialData?.socialLinks?.linkedin || ""
      },
      officeHours: initialData?.officeHours || "",
      worshipTimes: initialData?.worshipTimes || "",
      additionalTimes: initialData?.additionalTimes || [],
    };
    return mappedData;
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(initialData?.logoUrl || "");

  // Update form data when initialData changes (e.g., community selection changes)
  useEffect(() => {
    if (initialData) {
      const mappedData = {
        name: initialData?.name || "",
        type: initialData?.type || "",
        denomination: initialData?.denomination || "",
        description: initialData?.description || "",
        address: initialData?.address || "",
        city: initialData?.city || "",
        state: initialData?.state || "",
        zipCode: initialData?.zipCode || "",
        phone: initialData?.phone || "",
        email: initialData?.email || "",
        website: initialData?.website || "",
        logoUrl: initialData?.logoUrl || "",
        establishedYear: initialData?.establishedYear || undefined,
        weeklyAttendance: (initialData as any)?.size || initialData?.weeklyAttendance || "", // Map size to weeklyAttendance
        parentChurchName: initialData?.parentChurchName || "",
        missionStatement: (initialData as any)?.bio || initialData?.missionStatement || "", // Map bio to missionStatement
        socialLinks: {
          facebook: initialData?.socialLinks?.facebook || "",
          instagram: initialData?.socialLinks?.instagram || "",
          twitter: initialData?.socialLinks?.twitter || "",
          tiktok: initialData?.socialLinks?.tiktok || "",
          youtube: initialData?.socialLinks?.youtube || "",
          linkedin: initialData?.socialLinks?.linkedin || ""
        },
        officeHours: initialData?.officeHours || "",
        worshipTimes: initialData?.worshipTimes || "",
        additionalTimes: initialData?.additionalTimes || [],
      };
      setFormData(mappedData);
      setLogoPreview(initialData?.logoUrl || "");
    }
  }, [initialData]);

  // Auto-fill office hours and worship times based on denomination
  useEffect(() => {
    if (formData.denomination) {
      const denominationDefaults: { [key: string]: { officeHours: string; worshipTimes: string } } = {
        // Catholic Churches
        "Catholic": {
          officeHours: "Mon-Fri 9AM-5PM\nSat 9AM-12PM",
          worshipTimes: "Saturday: 5:30PM (Vigil Mass)\nSunday: 7AM, 9AM, 11AM, 5PM\nDaily Mass: Mon-Fri 8AM, Sat 8AM"
        },
        
        // Baptist Churches
        "Baptist": {
          officeHours: "Mon-Fri 9AM-4PM",
          worshipTimes: "Sunday: 9AM (Sunday School), 10:30AM (Morning Worship), 6PM (Evening Service)\nWednesday: 7PM (Prayer Meeting)"
        },
        "Southern Baptist": {
          officeHours: "Mon-Fri 8:30AM-4:30PM",
          worshipTimes: "Sunday: 9:15AM (Sunday School), 10:30AM (Morning Worship), 6PM (Evening Worship)\nWednesday: 6:30PM (Prayer Service & Bible Study)"
        },
        
        // Methodist Churches
        "Methodist": {
          officeHours: "Mon-Fri 9AM-3PM",
          worshipTimes: "Sunday: 8:30AM (Traditional), 11AM (Contemporary)\nWednesday: 7PM (Bible Study)"
        },
        "United Methodist": {
          officeHours: "Tue-Fri 9AM-4PM",
          worshipTimes: "Sunday: 8:30AM (Traditional), 10:45AM (Contemporary)\nWednesday: 7PM (Bible Study & Prayer)"
        },
        
        // Presbyterian Churches
        "Presbyterian": {
          officeHours: "Mon-Fri 9AM-4PM",
          worshipTimes: "Sunday: 9AM (Sunday School), 10:30AM (Worship Service)\nWednesday: 7PM (Prayer & Bible Study)"
        },
        
        // Lutheran Churches
        "Lutheran": {
          officeHours: "Mon-Fri 9AM-4PM",
          worshipTimes: "Sunday: 8AM (Traditional), 10:30AM (Contemporary)\nWednesday: 7PM (Bible Study)"
        },
        
        // Episcopal/Anglican Churches
        "Episcopal": {
          officeHours: "Mon-Fri 9AM-4PM",
          worshipTimes: "Sunday: 8AM (Holy Eucharist), 10:30AM (Holy Eucharist with Music)\nWednesday: 12PM (Healing Service)"
        },
        "Anglican": {
          officeHours: "Mon-Fri 9AM-4PM",
          worshipTimes: "Sunday: 8AM (Holy Communion), 10:30AM (Sung Eucharist)\nWednesday: 10AM (Said Eucharist)"
        },
        
        // Pentecostal Churches
        "Pentecostal": {
          officeHours: "Mon-Fri 9AM-5PM",
          worshipTimes: "Sunday: 10AM (Morning Worship), 6PM (Evening Service)\nWednesday: 7PM (Bible Study & Prayer)\nFriday: 7PM (Youth Service)"
        },
        "Assembly of God": {
          officeHours: "Mon-Fri 9AM-5PM",
          worshipTimes: "Sunday: 9AM (Sunday School), 10:30AM (Morning Worship), 6:30PM (Evening Service)\nWednesday: 7PM (Midweek Service)"
        },
        
        // Orthodox Churches
        "Orthodox": {
          officeHours: "Mon-Fri 10AM-4PM",
          worshipTimes: "Saturday: 6PM (Vespers)\nSunday: 9AM (Matins), 10:30AM (Divine Liturgy)\nDaily: Morning & Evening Prayers"
        },
        "Eastern Orthodox": {
          officeHours: "Mon-Fri 10AM-4PM",
          worshipTimes: "Saturday: 6PM (Great Vespers)\nSunday: 8:45AM (Matins), 10AM (Divine Liturgy)"
        },
        
        // Non-denominational
        "Non-denominational": {
          officeHours: "Mon-Fri 9AM-4PM",
          worshipTimes: "Sunday: 9AM & 11AM (Worship Services)\nWednesday: 7PM (Bible Study & Prayer)"
        },
        "Community Church": {
          officeHours: "Mon-Fri 9AM-4PM",
          worshipTimes: "Sunday: 9AM & 10:45AM (Worship Services)\nWednesday: 7PM (Community Groups)"
        },
        
        // Seventh-day Adventist
        "Seventh-day Adventist": {
          officeHours: "Mon-Thu 9AM-4PM, Sun 9AM-4PM",
          worshipTimes: "Friday: 7PM (Vespers)\nSaturday: 9:30AM (Sabbath School), 11AM (Divine Worship), 2PM (Afternoon Programs)"
        }
      };

      const defaults = denominationDefaults[formData.denomination];
      if (defaults) {
        setFormData(prev => ({
          ...prev,
          officeHours: defaults.officeHours,
          worshipTimes: defaults.worshipTimes
        }));
      }
    }
  }, [formData.denomination, mode]);

  const handleInputChange = (field: keyof CommunityFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const addAdditionalTime = () => {
    setFormData(prev => {
      const currentTimes = prev.additionalTimes || [];
      if (currentTimes.length >= 6) {
        return prev; // Don't add if already at limit
      }
      return {
        ...prev,
        additionalTimes: [
          ...currentTimes,
          { eventLabel: "", timeSchedule: "", language: "English" }
        ]
      };
    });
  };

  const updateAdditionalTime = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      additionalTimes: prev.additionalTimes?.map((time, i) => 
        i === index ? { ...time, [field]: value } : time
      ) || []
    }));
  };

  const removeAdditionalTime = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalTimes: prev.additionalTimes?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      ...formData,
      logoFile: logoFile || undefined
    } as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Community Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="First Baptist Church"
              />
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select community type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Church">Church</SelectItem>
                  <SelectItem value="Ministry">Ministry</SelectItem>
                  <SelectItem value="Group">Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="denomination">Denomination *</Label>
              <Select
                value={formData.denomination}
                onValueChange={(value) => handleInputChange('denomination', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select denomination or type..." />
                </SelectTrigger>
                <SelectContent>
                  {DENOMINATION_OPTIONS.map((denomination) => (
                    <SelectItem key={denomination} value={denomination}>
                      {denomination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.denomination === 'Other' && (
                <div className="mt-2">
                  <Input
                    placeholder="Please specify denomination"
                    value={formData.customDenomination || ''}
                    onChange={(e) => handleInputChange('customDenomination', e.target.value)}
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="establishedYear">Established Year</Label>
              <Input
                id="establishedYear"
                type="number"
                value={formData.establishedYear || ''}
                onChange={(e) => handleInputChange('establishedYear', parseInt(e.target.value) || undefined)}
                placeholder="2020"
              />
            </div>
            <div>
              <Label htmlFor="weeklyAttendance">👥 Weekly Attendance</Label>
              <Select
                value={formData.weeklyAttendance || ''}
                onValueChange={(value) => handleInputChange('weeklyAttendance', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select attendance size" />
                </SelectTrigger>
                <SelectContent>
                  {WEEKLY_ATTENDANCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="parentChurchName">Parent Church (if applicable)</Label>
              <Input
                id="parentChurchName"
                value={formData.parentChurchName || ''}
                onChange={(e) => handleInputChange('parentChurchName', e.target.value)}
                placeholder="Main Campus Church Name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell people about your community..."
              />
            </div>
            <div>
              <Label htmlFor="missionStatement">Mission Statement</Label>
              <Textarea
                id="missionStatement"
                rows={3}
                value={formData.missionStatement || ''}
                onChange={(e) => handleInputChange('missionStatement', e.target.value)}
                placeholder="Our mission is to..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                required
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Los Angeles"
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  required
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="CA"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="zipCode">Zip Code *</Label>
              <Input
                id="zipCode"
                required
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="90210"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="pastor@church.org"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.church.org"
              />
            </div>
          </CardContent>
        </Card>

        {/* Community Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Community Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {logoPreview ? (
              <div className="flex items-center space-x-4">
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Logo selected: {logoFile?.name}</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview("");
                    }}
                    className="mt-2"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      setLogoFile(file);
                      const reader = new FileReader();
                      reader.onload = (e) => setLogoPreview(e.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <div className="text-gray-400">
                      <Upload className="mx-auto h-12 w-12" />
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        Click to upload
                      </span>
                      {" "}or drag and drop
                    </div>
                    <div className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </div>
                  </div>
                </label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Social Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="facebookUrl">Facebook URL</Label>
                <Input
                  id="facebookUrl"
                  placeholder="https://facebook.com/community"
                  value={formData.socialLinks?.facebook || ''}
                  onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="instagramUrl">Instagram URL</Label>
                <Input
                  id="instagramUrl"
                  placeholder="https://instagram.com/community"
                  value={formData.socialLinks?.instagram || ''}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="twitterUrl">Twitter (X) URL</Label>
                <Input
                  id="twitterUrl"
                  placeholder="https://x.com/community"
                  value={formData.socialLinks?.twitter || ''}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tiktokUrl">TikTok URL</Label>
                <Input
                  id="tiktokUrl"
                  placeholder="https://tiktok.com/@community"
                  value={formData.socialLinks?.tiktok || ''}
                  onChange={(e) => handleSocialLinkChange('tiktok', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="youtubeUrl">YouTube URL</Label>
                <Input
                  id="youtubeUrl"
                  placeholder="https://youtube.com/community"
                  value={formData.socialLinks?.youtube || ''}
                  onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  placeholder="https://linkedin.com/company/community"
                  value={formData.socialLinks?.linkedin || ''}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Times & Hours */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Service Times & Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="officeHours">🕒 Office Hours (Auto-filled by denomination)</Label>
              <Textarea
                id="officeHours"
                rows={2}
                value={formData.officeHours || ''}
                onChange={(e) => handleInputChange('officeHours', e.target.value)}
                placeholder="Mon-Fri 9AM-4PM"
              />
            </div>
            <div>
              <Label htmlFor="worshipTimes">⛪ Worship Times (Auto-filled by denomination)</Label>
              <Textarea
                id="worshipTimes"
                rows={3}
                value={formData.worshipTimes || ''}
                onChange={(e) => handleInputChange('worshipTimes', e.target.value)}
                placeholder="Sunday: 9AM & 11AM"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label>Additional Times (up to 6)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAdditionalTime}
                  disabled={(formData.additionalTimes?.length || 0) >= 6}
                >
                  {(formData.additionalTimes?.length || 0) >= 6 ? 'Limit Reached (6/6)' : `Add Time (${(formData.additionalTimes?.length || 0)}/6)`}
                </Button>
              </div>
              {formData.additionalTimes?.map((time, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label>Event/Time Label</Label>
                    <Input
                      placeholder="Youth Service"
                      value={time.eventLabel}
                      onChange={(e) => updateAdditionalTime(index, 'eventLabel', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Time/Schedule</Label>
                    <Input
                      placeholder="Friday 7PM"
                      value={time.timeSchedule}
                      onChange={(e) => updateAdditionalTime(index, 'timeSchedule', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Language</Label>
                    <Select
                      value={time.language}
                      onValueChange={(value) => updateAdditionalTime(index, 'language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="Korean">Korean</SelectItem>
                        <SelectItem value="Chinese">Chinese</SelectItem>
                        <SelectItem value="Portuguese">Portuguese</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAdditionalTime(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : submitButtonText}
        </Button>
      </div>
    </form>
  );
}