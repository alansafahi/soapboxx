import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "../hooks/use-toast";
import { Building2, Settings, Users, Calendar } from "lucide-react";
import { CommunitySettings } from "./CommunitySettings";
import { ChurchFeatureManager } from "./ChurchFeatureManager";
import { EventManagement } from "./EventManagement";
import CampusManagement from "./CampusManagement";
import { CommunityForm } from "./CommunityForm";

interface CommunityProfile {
  id: number;
  name: string;
  type: string;
  denomination: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
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
  };
  officeHours?: string;
  worshipTimes?: string;
  customDenomination?: string;
}

export function CommunityAdminTab() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Get communities where user has admin role - always call hooks in same order
  const { data: adminCommunities = [], isLoading: communitiesLoading, error: communitiesError } = useQuery({
    queryKey: ["/api/users/communities"],
    enabled: !!user && isAuthenticated,
    retry: 2,
  }) as { data: any[], isLoading: boolean, error: any };

  // Get communities created by user - always call hooks in same order
  const { data: createdCommunities = [], isLoading: createdLoading, error: createdError } = useQuery({
    queryKey: ["/api/users/created-churches"],
    enabled: !!user && isAuthenticated,
    retry: 2,
  }) as { data: any[], isLoading: boolean, error: any };

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

  // Get selected community details - always call hooks in same order
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
    enabled: !!selectedCommunityId && isAuthenticated,
  }) as { data: CommunityProfile | null, isLoading: boolean };

  // Auto-select first community if none selected
  useEffect(() => {
    if (!selectedCommunityId && allAdminCommunities.length > 0) {
      setSelectedCommunityId(allAdminCommunities[0].id.toString());
    }
  }, [allAdminCommunities, selectedCommunityId]);

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      let logoUrl = profileData.logoUrl;
      
      // Upload logo if a file is selected
      if (profileData.logoFile) {
        const formData = new FormData();
        formData.append('logo', profileData.logoFile);
        
        const uploadResponse = await fetch('/api/upload/community-logo', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          logoUrl = uploadResult.logoUrl;
        } else {
          throw new Error("Logo upload failed");
        }
      }
      
      const response = await fetch(`/api/churches/${selectedCommunityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...profileData,
          logoUrl,
        }),
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

  const handleCommunitySubmit = (formData: any) => {
    saveProfileMutation.mutate(formData);
  };

  // Show authentication prompt if user is not logged in
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your communities...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to access Community Administration.
          </p>
        </div>
      </div>
    );
  }

  if (communitiesLoading || createdLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your communities...</p>
        </div>
      </div>
    );
  }

  if (communitiesError || createdError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto">
          <Building2 className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Communities
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            There was an error loading your communities. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  if (allAdminCommunities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Communities Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have administrative access to any communities yet. Create or join a community to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Community Administration</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your community settings, events, and features
          </p>
        </div>
        <div className="flex items-center space-x-4">
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
      </div>

      {selectedCommunity && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="campuses" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Campuses</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Events</span>
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
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Community Profile</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your community's basic information and contact details
                </p>
              </div>
              
              <CommunityForm
                mode="edit"
                initialData={selectedCommunity}
                onSubmit={handleCommunitySubmit}
                isLoading={saveProfileMutation.isPending}
                submitButtonText="Save Changes"
              />
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

          <TabsContent value="events" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Event Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create and manage events for your community
              </p>
            </div>
            <EventManagement />
          </TabsContent>

          <TabsContent value="campuses" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Campus Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage multiple campus locations for your community
              </p>
            </div>
            {selectedCommunityId && (
              <CampusManagement churchId={parseInt(selectedCommunityId)} />
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {selectedCommunityId && selectedCommunity && (
              <CommunitySettings 
                churchId={parseInt(selectedCommunityId)}
                userRole="church_admin"
                communityType={selectedCommunity.type}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}