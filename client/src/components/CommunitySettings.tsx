import React, { useState, useEffect } from "react";
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
  const [hasChanges, setHasChanges] = useState(false);

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

  // Initialize settings state when data loads
  useEffect(() => {
    if (currentSettings && Object.keys(settings).length === 0) {
      setSettings(currentSettings);
    }
  }, [currentSettings, settings]);

  // Auto-save settings mutation (saves immediately on toggle)
  const autoSaveSettingsMutation = useMutation({
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
      toast({ title: "Setting updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['community-settings', communityId] });
      setHasChanges(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update setting", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Manual save settings mutation
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
      setHasChanges(false);
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
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section as keyof CommunitySettings],
        [field]: value
      }
    };
    setSettings(newSettings);
    setHasChanges(true);
    
    // Auto-save for toggle switches to provide immediate feedback
    autoSaveSettingsMutation.mutate(newSettings);
  };

  // Get current value for a setting with fallbacks
  const getSetting = (section: string, field: string, defaultValue: any = false) => {
    return settings[section as keyof CommunitySettings]?.[field] ?? 
           currentSettings?.[section]?.[field] ?? 
           defaultValue;
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
        <Button 
          onClick={handleSave} 
          disabled={saveSettingsMutation.isPending || !hasChanges}
          variant={hasChanges ? "default" : "secondary"}
        >
          <Save className="h-4 w-4 mr-2" />
          {saveSettingsMutation.isPending ? "Saving..." : hasChanges ? "Save All Changes" : "All Saved"}
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
                    value={getSetting('basicInfo', 'name', '')}
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
                    checked={getSetting('administrative', 'multiCampusEnabled', false)}
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

        {/* Communication Settings Tab */}
        <TabsContent value="communication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Communication Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-600">Receive notifications for important updates</p>
                </div>
                <Switch
                  checked={getSetting('communication', 'notificationsEnabled', true)}
                  onCheckedChange={(checked) => updateSetting('communication', 'notificationsEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Newsletters</Label>
                  <p className="text-sm text-gray-600">Send weekly newsletters to members</p>
                </div>
                <Switch
                  checked={getSetting('communication', 'emailNewsletters', true)}
                  onCheckedChange={(checked) => updateSetting('communication', 'emailNewsletters', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Emergency Alerts</Label>
                  <p className="text-sm text-gray-600">Allow emergency notifications to bypass quiet hours</p>
                </div>
                <Switch
                  checked={getSetting('communication', 'emergencyAlerts', true)}
                  onCheckedChange={(checked) => updateSetting('communication', 'emergencyAlerts', checked)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Quiet Hours</Label>
                    <p className="text-sm text-gray-600">Set times when notifications are limited</p>
                  </div>
                  <Switch
                    checked={getSetting('communication', 'quietHours', { enabled: false }).enabled}
                    onCheckedChange={(checked) => updateSetting('communication', 'quietHours', { 
                      ...getSetting('communication', 'quietHours', { enabled: false, startTime: '22:00', endTime: '08:00' }), 
                      enabled: checked 
                    })}
                  />
                </div>
                
                {getSetting('communication', 'quietHours', { enabled: false }).enabled && (
                  <div className="grid grid-cols-2 gap-4 pl-4">
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={getSetting('communication', 'quietHours', { startTime: '22:00' }).startTime || '22:00'}
                        onChange={(e) => updateSetting('communication', 'quietHours', {
                          ...getSetting('communication', 'quietHours', { enabled: false, startTime: '22:00', endTime: '08:00' }),
                          startTime: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={getSetting('communication', 'quietHours', { endTime: '08:00' }).endTime || '08:00'}
                        onChange={(e) => updateSetting('communication', 'quietHours', {
                          ...getSetting('communication', 'quietHours', { enabled: false, startTime: '22:00', endTime: '08:00' }),
                          endTime: e.target.value
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy & Safety Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Safety Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Member Directory Visible</Label>
                  <p className="text-sm text-gray-600">Allow members to view the community directory</p>
                </div>
                <Switch
                  checked={getSetting('privacy', 'memberDirectoryVisible', true)}
                  onCheckedChange={(checked) => updateSetting('privacy', 'memberDirectoryVisible', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Photo Sharing</Label>
                  <p className="text-sm text-gray-600">Allow members to share photos in posts</p>
                </div>
                <Switch
                  checked={getSetting('privacy', 'photoSharingEnabled', true)}
                  onCheckedChange={(checked) => updateSetting('privacy', 'photoSharingEnabled', checked)}
                />
              </div>

              <div>
                <Label>Content Moderation</Label>
                <Select
                  value={settings.privacy?.contentModeration || currentSettings?.privacy?.contentModeration || 'automatic'}
                  onValueChange={(value) => updateSetting('privacy', 'contentModeration', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic AI Moderation</SelectItem>
                    <SelectItem value="manual">Manual Admin Review</SelectItem>
                    <SelectItem value="community">Community Reporting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Background Checks Required</Label>
                  <p className="text-sm text-gray-600">Require background checks for volunteer positions</p>
                </div>
                <Switch
                  checked={settings.privacy?.backgroundChecksRequired || currentSettings?.privacy?.backgroundChecksRequired || false}
                  onCheckedChange={(checked) => updateSetting('privacy', 'backgroundChecksRequired', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab (Churches & Ministries Only) */}
        {(communityType === "church" || communityType === "ministry") && (
          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Donations</Label>
                    <p className="text-sm text-gray-600">Allow members to make donations through the app</p>
                  </div>
                  <Switch
                    checked={settings.financial?.donationsEnabled || currentSettings?.financial?.donationsEnabled || true}
                    onCheckedChange={(checked) => updateSetting('financial', 'donationsEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Recurring Giving</Label>
                    <p className="text-sm text-gray-600">Enable automatic recurring donations</p>
                  </div>
                  <Switch
                    checked={settings.financial?.recurringGivingEnabled || currentSettings?.financial?.recurringGivingEnabled || true}
                    onCheckedChange={(checked) => updateSetting('financial', 'recurringGivingEnabled', checked)}
                  />
                </div>

                <div>
                  <Label>Financial Transparency</Label>
                  <Select
                    value={settings.financial?.financialTransparency || currentSettings?.financial?.financialTransparency || 'summary'}
                    onValueChange={(value) => updateSetting('financial', 'financialTransparency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Financial Reports</SelectItem>
                      <SelectItem value="summary">Summary Reports Only</SelectItem>
                      <SelectItem value="private">Private - Admin Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Stripe Integration</Label>
                    <p className="text-sm text-gray-600">Connect Stripe for payment processing</p>
                  </div>
                  <Switch
                    checked={settings.financial?.stripeIntegration || currentSettings?.financial?.stripeIntegration || false}
                    onCheckedChange={(checked) => updateSetting('financial', 'stripeIntegration', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                External Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Calendar Sync</Label>
                  <p className="text-sm text-gray-600">Sync events with external calendar apps</p>
                </div>
                <Switch
                  checked={settings.integrations?.calendarSync || currentSettings?.integrations?.calendarSync || false}
                  onCheckedChange={(checked) => updateSetting('integrations', 'calendarSync', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Social Media Sharing</Label>
                  <p className="text-sm text-gray-600">Enable sharing to social media platforms</p>
                </div>
                <Switch
                  checked={settings.integrations?.socialMediaSharing || currentSettings?.integrations?.socialMediaSharing || true}
                  onCheckedChange={(checked) => updateSetting('integrations', 'socialMediaSharing', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email Provider</Label>
                  <Select
                    value={settings.integrations?.emailProvider || currentSettings?.integrations?.emailProvider || 'default'}
                    onValueChange={(value) => updateSetting('integrations', 'emailProvider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">SoapBox Email</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailchimp">Mailchimp</SelectItem>
                      <SelectItem value="constant-contact">Constant Contact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>SMS Provider</Label>
                  <Select
                    value={settings.integrations?.smsProvider || currentSettings?.integrations?.smsProvider || 'default'}
                    onValueChange={(value) => updateSetting('integrations', 'smsProvider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">SoapBox SMS</SelectItem>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="textmagic">TextMagic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}