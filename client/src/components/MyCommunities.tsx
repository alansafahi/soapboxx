import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Building, MapPin, Users, Calendar, Plus, Settings, Eye, Trash2 } from "lucide-react";
import { CommunityViewDialog } from "./CommunityViewDialog";
import { CommunityCreationForm, createCommunitySchema, type CommunityFormData } from "./CommunityCreationForm";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";

interface Community {
  id: number;
  name: string;
  type: string; // church, group, ministry
  denomination: string;
  address: string;
  city: string;
  state: string;
  memberCount: number;
  role: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  phone?: string;
}



export default function MyCommunities() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Handle community deletion
  const deleteCommunityMutation = useMutation({
    mutationFn: async (communityId: number) => {
      const response = await fetch(`/api/communities/${communityId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete community');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Community Deleted",
        description: "The community has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/communities/user'] });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete community",
        variant: "destructive",
      });
    },
  });

  const handleDeleteCommunity = (communityId: number) => {
    if (window.confirm('Are you sure you want to delete this community? This action cannot be undone.')) {
      deleteCommunityMutation.mutate(communityId);
    }
  };

  const [createCommunityOpen, setCreateCommunityOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  
  const { data: userCommunities = [], isLoading, error } = useQuery<Community[]>({
    queryKey: ["/api/users/communities"],
    enabled: !!user,
  });

  // Create community mutation
  const createCommunityMutation = useMutation({
    mutationFn: async (data: CommunityFormData) => {
      const normalizedData = {
        ...data,
        website: data.website?.trim() ? 
          (data.website.startsWith("http://") || data.website.startsWith("https://") ? 
            data.website : `https://${data.website}`) : "",
      };
      
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(normalizedData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create community');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Community created successfully!",
        description: "Your new community has been created and you are now the administrator.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users/communities"] });
      setCreateCommunityOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create community",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Communities</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Communities</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600 dark:text-red-400">Failed to load communities. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Communities</h1>
        <div className="flex gap-2">
          <Dialog open={createCommunityOpen} onOpenChange={setCreateCommunityOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Community
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Community</DialogTitle>
                <DialogDescription>
                  Set up your church, ministry, or group to connect with members and manage activities.
                </DialogDescription>
              </DialogHeader>
              <CommunityCreationForm
                onSubmit={(data) => createCommunityMutation.mutate(data)}
                isLoading={createCommunityMutation.isPending}
                submitButtonText="Create Community"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {userCommunities.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Communities Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first community to start connecting with members and organizing activities.
            </p>
            <Button onClick={() => setCreateCommunityOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Community
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userCommunities.map((community) => (
            <Card key={community.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {community.logoUrl ? (
                      <img 
                        src={community.logoUrl} 
                        alt={community.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{community.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {community.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCommunityId(community.id.toString());
                        setViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {(community.role === 'admin' || community.role === 'pastor' || community.role === 'lead-pastor' || community.role === 'elder') && (
                      <Link href={`/admin?tab=community-admin&communityId=${community.id}`}>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    {community.role === 'creator' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCommunity(community.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {community.type} • {community.denomination}
                </CardDescription>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{community.city}, {community.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{community.memberCount} members</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedCommunityId && (
        <CommunityViewDialog
          communityId={selectedCommunityId}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />
      )}
    </div>
  );
}