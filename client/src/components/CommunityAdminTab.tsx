import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "../hooks/use-toast";
import { Building2, Settings, Users, Eye, Save, MapPin, Phone, Mail, Globe } from "lucide-react";
import { CommunitySettings } from "./CommunitySettings";
import { ChurchFeatureManager } from "./ChurchFeatureManager";

interface CommunityProfile {
  id: number;
  name: string;
  type: string;
  denomination: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  bio?: string;
  memberCount: number;
  role?: string;
}

export function CommunityAdminTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [editedProfile, setEditedProfile] = useState<Partial<CommunityProfile>>({});

  // Get communities where user has admin role
  const { data: adminCommunities = [], isLoading: communitiesLoading } = useQuery({
    queryKey: ["/api/users/communities"],
    enabled: !!user,
  }) as { data: any[], isLoading: boolean };

  // Get communities created by user
  const { data: createdCommunities = [], isLoading: createdLoading } = useQuery({
    queryKey: ["/api/users/created-churches"],
    enabled: !!user,
  }) as { data: any[], isLoading: boolean };

  // Filter to only communities where user has admin access
  const adminAccessCommunities = (adminCommunities || []).filter((community: any) => {
    const adminRoles = ['church_admin', 'church-admin', 'admin', 'pastor', 'lead-pastor', 'elder', 'soapbox_owner'];
    return adminRoles.includes(community.role);
  });

  // Combine both admin and created communities, avoiding duplicates
  const allAdminCommunities = [...adminAccessCommunities];
  createdCommunities.forEach((created: any) => {
    if (!allAdminCommunities.find(admin => admin.id === created.id)) {
      allAdminCommunities.push({ ...created, role: 'creator' });
    }
  });

  // Auto-select first community if none selected
  useEffect(() => {
    if (!selectedCommunityId && allAdminCommunities.length > 0) {
      setSelectedCommunityId(allAdminCommunities[0].id.toString());
    }
  }, [allAdminCommunities, selectedCommunityId]);

  // Get selected community details
  const { data: selectedCommunity, isLoading: communityLoading } = useQuery({
    queryKey: ['community-details', selectedCommunityId],
    queryFn: async () => {
      if (!selectedCommunityId) return null;
      const response = await fetch(`/api/churches/${selectedCommunityId}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch community details');
      }
      return await response.json();
    },
    enabled: !!selectedCommunityId,
  }) as { data: CommunityProfile | null, isLoading: boolean };

  // Initialize edited profile when community data loads
  useEffect(() => {
    if (selectedCommunity && Object.keys(editedProfile).length === 0) {
      setEditedProfile(selectedCommunity);
    }
  }, [selectedCommunity, editedProfile]);

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<CommunityProfile>) => {
      const response = await fetch(`/api/churches/${selectedCommunityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });
      if (!response.ok) throw new Error('Failed to save community profile');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Community profile updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['community-details', selectedCommunityId] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update community profile", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleSave = () => {
    saveProfileMutation.mutate(editedProfile);
  };

  const handleInputChange = (field: keyof CommunityProfile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  if (communitiesLoading || createdLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading communities...</p>
        </CardContent>
      </Card>
    );
  }

  if (allAdminCommunities.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Admin Access</h3>
          <p className="text-gray-600">You don't have administrative access to any communities yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Contact your community leaders to request admin permissions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Community Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Community Administration</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your community profile, settings, and features
          </p>
        </div>
        
        {allAdminCommunities.length > 1 && (
          <Select value={selectedCommunityId || ""} onValueChange={setSelectedCommunityId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a community" />
            </SelectTrigger>
            <SelectContent>
              {allAdminCommunities.map((community: any) => (
                <SelectItem key={community.id} value={community.id.toString()}>
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    <span>{community.name}</span>
                    <span className="text-xs text-gray-500">
                      ({community.role === 'creator' ? 'Creator' : community.role})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedCommunity && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Features</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Header with Save Button */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Community Profile</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your community's basic information and contact details
                </p>
              </div>
              <Button onClick={handleSave} disabled={saveProfileMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {saveProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>

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
                    <Label htmlFor="name">Community Name</Label>
                    <Input
                      id="name"
                      value={editedProfile.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="denomination">Type/Denomination</Label>
                    <Input
                      id="denomination"
                      value={editedProfile.denomination || ''}
                      onChange={(e) => handleInputChange('denomination', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={3}
                      value={editedProfile.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Tell people about your community..."
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
                      value={editedProfile.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contact@community.org"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={editedProfile.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://community.org"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={editedProfile.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={editedProfile.city || ''}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={editedProfile.state || ''}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="CA"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input
                        id="zipCode"
                        value={editedProfile.zipCode || ''}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder="90210"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            {selectedCommunityId && selectedCommunity && (
              <ChurchFeatureManager 
                churchId={parseInt(selectedCommunityId)}
                userRole="church_admin"
                communityType={selectedCommunity.type}
              />
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {selectedCommunityId && selectedCommunity && (
              <CommunitySettings 
                communityId={parseInt(selectedCommunityId)}
                communityType={selectedCommunity.type as "church" | "group" | "ministry"}
                userRole="church_admin"
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}