import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "../hooks/use-toast";
import { Building2, Settings, Users, Eye } from "lucide-react";
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
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Get communities where user has admin role
  const { data: adminCommunities = [], isLoading: communitiesLoading } = useQuery({
    queryKey: ["/api/users/communities"],
    enabled: !!user,
  }) as { data: any[], isLoading: boolean };

  // Filter to only communities where user has admin access
  const adminAccessCommunities = (adminCommunities || []).filter((community: any) => {
    const adminRoles = ['church_admin', 'church-admin', 'admin', 'pastor', 'lead-pastor', 'elder', 'soapbox_owner'];
    return adminRoles.includes(community.role);
  });

  // Auto-select first community if none selected
  useEffect(() => {
    if (!selectedCommunityId && adminAccessCommunities.length > 0) {
      setSelectedCommunityId(adminAccessCommunities[0].id.toString());
    }
  }, [adminAccessCommunities, selectedCommunityId]);

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

  if (communitiesLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading communities...</p>
        </CardContent>
      </Card>
    );
  }

  if (adminAccessCommunities.length === 0) {
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
        
        {adminAccessCommunities.length > 1 && (
          <Select value={selectedCommunityId || ""} onValueChange={setSelectedCommunityId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a community" />
            </SelectTrigger>
            <SelectContent>
              {adminAccessCommunities.map((community: any) => (
                <SelectItem key={community.id} value={community.id.toString()}>
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    <span>{community.name}</span>
                    <span className="text-xs text-gray-500">({community.role})</span>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Community Profile Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Profile Management</h3>
                  <p className="text-gray-600 mb-4">
                    Manage your community's basic information, contact details, and public profile.
                  </p>
                  <Button onClick={() => window.open(`/community-management/${selectedCommunityId}`, '_blank')}>
                    Open Profile Manager
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Feature Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCommunityId && (
                  <ChurchFeatureManager 
                    churchId={parseInt(selectedCommunityId)}
                    userRole="church_admin"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {selectedCommunityId && selectedCommunity && (
              <CommunitySettings 
                communityId={selectedCommunityId}
                communityName={selectedCommunity.name}
                communityType={selectedCommunity.type as "church" | "group" | "ministry"}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}