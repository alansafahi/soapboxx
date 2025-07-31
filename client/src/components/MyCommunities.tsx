import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CommunityForm } from "./CommunityForm";
import { CommunityViewDialog } from "./CommunityViewDialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Community {
  id: number;
  name: string;
  type: string;
  denomination: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  adminEmail: string;
  adminPhone: string;
  website: string;
  logoUrl?: string;
  establishedYear?: number;
  weeklyAttendance?: string;
  parentChurchName?: string;
  description?: string;
  missionStatement?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  officeHours?: string;
  worshipTimes?: string;
  privacyLevel: string;
  hideAddressFromMembers?: boolean;
  hidePhoneFromMembers?: boolean;
}

interface UserCommunity {
  id: number;
  name: string;
  type: string;
  denomination: string;
  role: string;
  logoUrl?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  adminEmail: string; 
  adminPhone: string;
  website: string;
  establishedYear?: number;
  weeklyAttendance?: string;
  parentChurchName?: string;
  description?: string;
  missionStatement?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  officeHours?: string;
  worshipTimes?: string;
  privacyLevel: string;
  hideAddressFromMembers?: boolean;
  hidePhoneFromMembers?: boolean;
}

export default function MyCommunities() {
  const [createCommunityOpen, setCreateCommunityOpen] = useState(false);
  const [viewCommunityOpen, setViewCommunityOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<UserCommunity | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userCommunities = [], isLoading } = useQuery<UserCommunity[]>({
    queryKey: ['/api/users/communities'],
  });

  const createCommunityMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/communities', {
      method: 'POST',
      body: data,
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Community created successfully!",
      });
      setCreateCommunityOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users/communities'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create community",
        variant: "destructive",
      });
    },
  });

  const handleViewCommunity = (community: UserCommunity) => {
    setSelectedCommunity(community);
    setViewCommunityOpen(true);
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
      case 'creator':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'lead-pastor':
      case 'pastor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'admin':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'elder':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'ministry-leader':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'member':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'church':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'ministry':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'group':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Communities</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
            <DialogContent 
              className="max-w-4xl max-h-[95vh] overflow-y-auto z-[60] bg-white dark:bg-gray-900 text-black dark:text-white border-2 border-gray-300 dark:border-gray-600"
              onPointerDownOutside={(e) => {
                console.log('Pointer down outside detected');
                e.preventDefault();
              }}>
              <DialogHeader>
                <DialogTitle className="text-black dark:text-white">Create A New Community</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-300">
                  Set up a new community and become its administrator
                </DialogDescription>
              </DialogHeader>
              
              <CommunityForm
                onSuccess={() => {
                  setCreateCommunityOpen(false);
                }}
                onCancel={() => {
                  setCreateCommunityOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {userCommunities.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Communities Yet</CardTitle>
            <CardDescription>
              You haven't joined any communities yet. Create your first community or discover existing ones to join.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button onClick={() => setCreateCommunityOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Community
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Churches Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Churches
              </h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {userCommunities.filter(c => c.type === 'church').length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCommunities
                .filter(community => community.type === 'church')
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((community) => (
                  <Card key={community.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {community.logoUrl && (
                              <img 
                                src={community.logoUrl} 
                                alt={`${community.name} logo`}
                                className="w-8 h-8 rounded object-contain"
                              />
                            )}
                            <CardTitle className="text-lg">{community.name}</CardTitle>
                          </div>
                          <CardDescription className="text-sm">
                            {community.denomination} • {community.city}, {community.state}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge className={getTypeColor(community.type)}>
                            {community.type}
                          </Badge>
                          <Badge className={getRoleColor(community.role)}>
                            {community.role}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCommunity(community)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {(community.role === 'admin' || community.role === 'pastor' || 
                          community.role === 'lead-pastor' || community.role === 'elder' || 
                          community.role === 'church_admin') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = '/admin?tab=community-admin'}
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

          {/* Ministries Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Ministries
              </h2>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                {userCommunities.filter(c => c.type === 'ministry').length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCommunities
                .filter(community => community.type === 'ministry')
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((community) => (
                  <Card key={community.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {community.logoUrl && (
                              <img 
                                src={community.logoUrl} 
                                alt={`${community.name} logo`}
                                className="w-8 h-8 rounded object-contain"
                              />
                            )}
                            <CardTitle className="text-lg">{community.name}</CardTitle>
                          </div>
                          <CardDescription className="text-sm">
                            {community.denomination} • {community.city}, {community.state}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge className={getTypeColor(community.type)}>
                            {community.type}
                          </Badge>
                          <Badge className={getRoleColor(community.role)}>
                            {community.role}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCommunity(community)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {(community.role === 'admin' || community.role === 'pastor' || 
                          community.role === 'lead-pastor' || community.role === 'elder' || 
                          community.role === 'church_admin') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = '/admin?tab=community-admin'}
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

          {/* Groups Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Groups
              </h2>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                {userCommunities.filter(c => c.type === 'group').length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCommunities
                .filter(community => community.type === 'group')
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((community) => (
                  <Card key={community.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {community.logoUrl && (
                              <img 
                                src={community.logoUrl} 
                                alt={`${community.name} logo`}
                                className="w-8 h-8 rounded object-contain"
                              />
                            )}
                            <CardTitle className="text-lg">{community.name}</CardTitle>
                          </div>
                          <CardDescription className="text-sm">
                            {community.denomination} • {community.city}, {community.state}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge className={getTypeColor(community.type)}>
                            {community.type}
                          </Badge>
                          <Badge className={getRoleColor(community.role)}>
                            {community.role}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCommunity(community)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {(community.role === 'admin' || community.role === 'pastor' || 
                          community.role === 'lead-pastor' || community.role === 'elder' || 
                          community.role === 'church_admin') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = '/admin?tab=community-admin'}
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
        </>
      )}

      {/* Community View Dialog */}
      {selectedCommunity && (
        <CommunityViewDialog
          community={selectedCommunity}
          open={viewCommunityOpen}
          onOpenChange={setViewCommunityOpen}
        />
      )}
    </div>
  );
}