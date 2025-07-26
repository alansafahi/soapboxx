import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { useToast } from "../hooks/use-toast";
import {
  Settings,
  Users,
  Shield,
  DollarSign,
  Bell,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building,
  Calendar,
  Lock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Save
} from "lucide-react";

interface CommunitySettingsProps {
  communityId: number;
  communityType: "church" | "group" | "ministry";
  userRole: string;
}

interface CommunitySettings {
  // Basic Information
  basicInfo: {
    name: string;
    description: string;
    website: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Administrative Settings (Churches Only)
  administrative?: {
    multiCampusEnabled: boolean;
    denominationSettings: string;
    churchSize: string;
    serviceTimesEnabled: boolean;
    verificationStatus: string;
  };
  
  // Community Configuration
  community: {
    memberApprovalRequired: boolean;
    directoryVisibility: "public" | "members" | "admins";
    allowGroupCreation: boolean;
    ageGroupFocus: string[];
  };
  
  // Communication Settings
  communication: {
    notificationsEnabled: boolean;
    emailNewsletters: boolean;
    emergencyAlerts: boolean;
    quietHours: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
  };
  
  // Financial Settings (Churches & Ministries)
  financial?: {
    donationsEnabled: boolean;
    recurringGivingEnabled: boolean;
    financialTransparency: "full" | "summary" | "private";
    stripeIntegration: boolean;
  };
  
  // Privacy & Safety
  privacy: {
    memberDirectoryVisible: boolean;
    photoSharingEnabled: boolean;
    contentModeration: "automatic" | "manual" | "community";
    backgroundChecksRequired: boolean;
  };
  
  // Integration Settings
  integrations: {
    calendarSync: boolean;
    socialMediaSharing: boolean;
    emailProvider: string;
    smsProvider: string;
  };
}

export function CommunitySettings({ communityId, communityType, userRole }: CommunitySettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");
  const [settings, setSettings] = useState<Partial<CommunitySettings>>({});

  // Fetch current community settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['community-settings', communityId],
    queryFn: async () => {
      const response = await fetch(`/api/communities/${communityId}/settings`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: Partial<CommunitySettings>) => {
      const response = await fetch(`/api/communities/${communityId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settingsData),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Settings updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['community-settings', communityId] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update settings", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  const updateSetting = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof CommunitySettings],
        [field]: value
      }
    }));
  };

  const hasAdminAccess = () => {
    const adminRoles = ['church_admin', 'owner', 'soapbox_owner', 'pastor', 'lead-pastor', 'ministry_leader'];
    return adminRoles.includes(userRole);
  };

  if (!hasAdminAccess()) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-gray-600">You need administrator permissions to access community settings.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </CardContent>
      </Card>
    );
  }

  // Define available tabs based on community type
  const getAvailableTabs = () => {
    const baseTabs = [
      { id: "basic", label: "Basic Info", icon: Settings },
      { id: "community", label: "Community", icon: Users },
      { id: "communication", label: "Communication", icon: Bell },
      { id: "privacy", label: "Privacy & Safety", icon: Shield },
      { id: "integrations", label: "Integrations", icon: Zap }
    ];

    if (communityType === "church") {
      baseTabs.splice(1, 0, { id: "administrative", label: "Administrative", icon: Building });
      baseTabs.splice(-1, 0, { id: "financial", label: "Financial", icon: DollarSign });
    } else if (communityType === "ministry") {
      baseTabs.splice(-1, 0, { id: "financial", label: "Financial", icon: DollarSign });
    }

    return baseTabs;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {communityType === "church" ? "Church" : communityType === "group" ? "Group" : "Ministry"} Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your {communityType} preferences and management options
          </p>
        </div>
        <Button onClick={handleSave} disabled={saveSettingsMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {saveSettingsMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 lg:grid-cols-6">
          {getAvailableTabs().map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">
                    {communityType === "church" ? "Church" : communityType === "group" ? "Group" : "Ministry"} Name
                  </Label>
                  <Input
                    id="name"
                    value={settings.basicInfo?.name || currentSettings?.basicInfo?.name || ''}
                    onChange={(e) => updateSetting('basicInfo', 'name', e.target.value)}
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={settings.basicInfo?.website || currentSettings?.basicInfo?.website || ''}
                    onChange={(e) => updateSetting('basicInfo', 'website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.basicInfo?.description || currentSettings?.basicInfo?.description || ''}
                  onChange={(e) => updateSetting('basicInfo', 'description', e.target.value)}
                  placeholder="Tell people about your community..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.basicInfo?.phone || currentSettings?.basicInfo?.phone || ''}
                    onChange={(e) => updateSetting('basicInfo', 'phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.basicInfo?.email || currentSettings?.basicInfo?.email || ''}
                    onChange={(e) => updateSetting('basicInfo', 'email', e.target.value)}
                    placeholder="contact@example.com"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Address</Label>
                <div className="space-y-3">
                  <Input
                    value={settings.basicInfo?.address || currentSettings?.basicInfo?.address || ''}
                    onChange={(e) => updateSetting('basicInfo', 'address', e.target.value)}
                    placeholder="Street Address"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      value={settings.basicInfo?.city || currentSettings?.basicInfo?.city || ''}
                      onChange={(e) => updateSetting('basicInfo', 'city', e.target.value)}
                      placeholder="City"
                    />
                    <Input
                      value={settings.basicInfo?.state || currentSettings?.basicInfo?.state || ''}
                      onChange={(e) => updateSetting('basicInfo', 'state', e.target.value)}
                      placeholder="State"
                    />
                    <Input
                      value={settings.basicInfo?.zipCode || currentSettings?.basicInfo?.zipCode || ''}
                      onChange={(e) => updateSetting('basicInfo', 'zipCode', e.target.value)}
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Administrative Tab (Churches Only) */}
        {communityType === "church" && (
          <TabsContent value="administrative" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Administrative Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Multi-Campus Management</Label>
                    <p className="text-sm text-gray-600">Enable management of multiple church campuses</p>
                  </div>
                  <Switch
                    checked={settings.administrative?.multiCampusEnabled || currentSettings?.administrative?.multiCampusEnabled || false}
                    onCheckedChange={(checked) => updateSetting('administrative', 'multiCampusEnabled', checked)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Church Size</Label>
                    <Select
                      value={settings.administrative?.churchSize || currentSettings?.administrative?.churchSize || ''}
                      onValueChange={(value) => updateSetting('administrative', 'churchSize', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select church size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (1-100 members)</SelectItem>
                        <SelectItem value="medium">Medium (101-500 members)</SelectItem>
                        <SelectItem value="large">Large (501-1000 members)</SelectItem>
                        <SelectItem value="mega">Mega Church (1000+ members)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Verification Status</Label>
                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant={currentSettings?.administrative?.verificationStatus === 'verified' ? 'default' : 'secondary'}>
                        {currentSettings?.administrative?.verificationStatus === 'verified' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Service Times Management</Label>
                    <p className="text-sm text-gray-600">Allow members to view and manage service schedules</p>
                  </div>
                  <Switch
                    checked={settings.administrative?.serviceTimesEnabled || currentSettings?.administrative?.serviceTimesEnabled || false}
                    onCheckedChange={(checked) => updateSetting('administrative', 'serviceTimesEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Community Configuration Tab */}
        <TabsContent value="community" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Community Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Member Approval Required</Label>
                  <p className="text-sm text-gray-600">Require admin approval for new members</p>
                </div>
                <Switch
                  checked={settings.community?.memberApprovalRequired || currentSettings?.community?.memberApprovalRequired || false}
                  onCheckedChange={(checked) => updateSetting('community', 'memberApprovalRequired', checked)}
                />
              </div>

              <div>
                <Label>Directory Visibility</Label>
                <Select
                  value={settings.community?.directoryVisibility || currentSettings?.community?.directoryVisibility || 'members'}
                  onValueChange={(value) => updateSetting('community', 'directoryVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can view</SelectItem>
                    <SelectItem value="members">Members Only</SelectItem>
                    <SelectItem value="admins">Admins Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Group Creation</Label>
                  <p className="text-sm text-gray-600">Let members create their own groups within the community</p>
                </div>
                <Switch
                  checked={settings.community?.allowGroupCreation || currentSettings?.community?.allowGroupCreation || false}
                  onCheckedChange={(checked) => updateSetting('community', 'allowGroupCreation', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* More tabs to be implemented... */}
        
      </Tabs>
    </div>
  );
}