import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings, Eye, SortAsc, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userCommunities = [], isLoading } = useQuery<UserCommunity[]>({
    queryKey: ['/api/users/communities'],
  });

  const createCommunityMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/communities', data),
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

  // Function to sort communities within each type group
  const sortCommunities = (communities: UserCommunity[]) => {
    return communities.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        // Sort by date added (assuming there's an id that represents creation order)
        return b.id - a.id; // Newer communities first
      }
    });
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

  // Component for rendering community card with mobile optimization
  const CommunityCard = ({ community }: { community: UserCommunity }) => (
    <Card key={community.id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {community.logoUrl && (
                <img 
                  src={community.logoUrl} 
                  alt={`${community.name} logo`}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded object-contain flex-shrink-0"
                />
              )}
              <CardTitle className="text-base sm:text-lg truncate">{community.name}</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {community.denomination} • {community.city}, {community.state}
            </CardDescription>
          </div>
          <div className="flex flex-row gap-1 sm:flex-col sm:gap-1 justify-start sm:justify-end">
            <Badge className={`${getTypeColor(community.type)} text-xs px-2 py-1`}>
              {community.type}
            </Badge>
            <Badge className={`${getRoleColor(community.role)} text-xs px-2 py-1`}>
              {community.role}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewCommunity(community)}
            className="flex-1 text-xs sm:text-sm"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            View Details
          </Button>
          {(community.role === 'admin' || community.role === 'pastor' || 
            community.role === 'lead-pastor' || community.role === 'elder' || 
            community.role === 'church_admin') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = `/community-administration?communityId=${community.id}`}
              className="sm:w-auto text-xs sm:text-sm"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="sm:hidden ml-1">Admin</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-0">
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">My Communities</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm lg:text-base">
            Communities you're part of and your roles
          </p>
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          {/* Sorting Toggle - Mobile Optimized */}
          <div className="flex items-center justify-center sm:justify-start">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2 hidden sm:inline">Sort by:</span>
            <ToggleGroup type="single" value={sortBy} onValueChange={(value) => value && setSortBy(value as 'name' | 'date')} className="grid grid-cols-2 w-full sm:w-auto">
              <ToggleGroupItem value="name" aria-label="Sort by name" size="sm" className="text-xs sm:text-sm">
                <SortAsc className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Name
              </ToggleGroupItem>
              <ToggleGroupItem value="date" aria-label="Sort by date added" size="sm" className="text-xs sm:text-sm">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Date Added
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <Dialog open={createCommunityOpen} onOpenChange={setCreateCommunityOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Create A Community</span>
                <span className="sm:hidden">Create Community</span>
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto z-[60] bg-white dark:bg-gray-900 text-black dark:text-white border-2 border-gray-300 dark:border-gray-600"
              onPointerDownOutside={(e) => {
                e.preventDefault();
              }}>
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl text-black dark:text-white">Create A New Community</DialogTitle>
                <DialogDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Set up a new community and become its administrator
                </DialogDescription>
              </DialogHeader>
              
              <CommunityForm
                mode="create"
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
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Churches
              </h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs sm:text-sm">
                {userCommunities.filter(c => c.type === 'church').length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortCommunities(userCommunities.filter(community => community.type === 'church'))
                .map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
            </div>
          </div>

          {/* Ministries Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Ministries
              </h2>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 text-xs sm:text-sm">
                {userCommunities.filter(c => c.type === 'ministry').length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortCommunities(userCommunities.filter(community => community.type === 'ministry'))
                .map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
            </div>
          </div>

          {/* Groups Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Groups
              </h2>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs sm:text-sm">
                {userCommunities.filter(c => c.type === 'group').length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortCommunities(userCommunities.filter(community => community.type === 'group'))
                .map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
            </div>
          </div>
        </>
      )}

      {/* Community View Dialog */}
      {selectedCommunity && (
        <CommunityViewDialog
          communityId={selectedCommunity.id.toString()}
          isOpen={viewCommunityOpen}
          onClose={() => setViewCommunityOpen(false)}
        />
      )}
    </div>
  );
}