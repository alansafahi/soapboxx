import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useToast } from "../hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Star,
  X,
  Crown,
  Users,
  MapPin,
  AlertTriangle,
  Settings,
  Edit
} from "lucide-react";

interface Church {
  id: number;
  name: string;
  denomination: string;
  city: string;
  state: string;
  memberCount: number;
  logoUrl?: string;
  role?: string; // User's role in this church
}

export default function MyChurches() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [disconnectDialog, setDisconnectDialog] = useState<{open: boolean, church: Church | null}>({
    open: false,
    church: null
  });
  const [selectPrimaryDialog, setSelectPrimaryDialog] = useState<{open: boolean, churches: Church[]}>({
    open: false,
    churches: []
  });

  // Helper function to check if user has admin access to church
  const hasChurchAdminAccess = (church: Church) => {
    const adminRoles = ['church_admin', 'owner', 'soapbox_owner', 'pastor', 'lead-pastor', 'system-admin'];
    // Only check church-specific role, not global platform role
    return adminRoles.includes(church.role || '');
  };

  // Handle church edit navigation
  const handleEditChurch = (church: Church) => {
    // Navigate to church management page with the church ID
    window.location.href = `/church-management/${church.id}`;
  };

  // Get user's joined churches
  const { data: userChurches, isLoading } = useQuery({
    queryKey: ['user-churches'],
    queryFn: async () => {
      const response = await fetch('/api/users/churches', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch churches');
      return response.json() as Church[];
    },
    enabled: !!user,
  });

  // Set primary church mutation
  const setPrimaryMutation = useMutation({
    mutationFn: async (churchId: number) => {
      const response = await fetch(`/api/users/churches/${churchId}/set-primary`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to set primary church');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-churches'] });
      queryClient.invalidateQueries({ queryKey: ['church-features'] });
      toast({
        title: "Primary Church Updated",
        description: "Your primary church has been set successfully."
      });
      setSelectPrimaryDialog({ open: false, churches: [] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to set primary church. Please try again."
      });
    }
  });

  // Disconnect from church mutation
  const disconnectMutation = useMutation({
    mutationFn: async (churchId: number) => {
      const response = await fetch(`/api/users/churches/${churchId}/disconnect`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to disconnect from church');
      return response.json();
    },
    onSuccess: (data, churchId) => {
      queryClient.invalidateQueries({ queryKey: ['user-churches'] });
      queryClient.invalidateQueries({ queryKey: ['church-features'] });
      
      // If disconnected from primary church and user has remaining churches, prompt to select new primary
      if (data.wasPrimary && data.remainingChurches > 0) {
        // Get updated churches list and show selection dialog
        const remainingChurches = userChurches?.filter(c => c.id !== churchId) || [];
        setSelectPrimaryDialog({ open: true, churches: remainingChurches });
        toast({
          title: "Disconnected from Primary Church",
          description: "Please select a new primary church from your remaining churches."
        });
      } else {
        toast({
          title: "Disconnected Successfully",
          description: `You have been disconnected from ${disconnectDialog.church?.name}.`
        });
      }
      
      setDisconnectDialog({ open: false, church: null });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to disconnect from church. Please try again."
      });
    }
  });

  const handleDisconnect = (church: Church) => {
    setDisconnectDialog({ open: true, church });
  };

  const handleSetPrimary = (churchId: number) => {
    setPrimaryMutation.mutate(churchId);
  };

  const confirmDisconnect = () => {
    if (disconnectDialog.church) {
      disconnectMutation.mutate(disconnectDialog.church.id);
    }
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            My Churches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading your churches...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userChurches || userChurches.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            My Churches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Churches Joined
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Join a church below to start connecting with your faith community.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const primaryChurch = userChurches[0]; // First church is primary (most recently accessed)

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            My Churches ({userChurches.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userChurches.map((church, index) => {
              const isPrimary = index === 0;
              
              return (
                <div
                  key={church.id}
                  className={`border rounded-xl p-4 transition-all ${
                    isPrimary 
                      ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20' 
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {/* Church Avatar */}
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={church.logoUrl} alt={church.name} />
                        <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                          {church.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Church Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {church.name}
                          </h3>
                          {isPrimary && (
                            <Badge variant="default" className="bg-purple-600 hover:bg-purple-700 text-white w-fit">
                              <Crown className="w-3 h-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">{church.denomination}</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{church.city}, {church.state}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{church.memberCount} members</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
                      {/* Church Admin Edit Button */}
                      {hasChurchAdminAccess(church) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditChurch(church)}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                        >
                          <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden xs:inline">Manage</span>
                          <span className="xs:hidden">Edit</span>
                        </Button>
                      )}
                      
                      {!isPrimary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetPrimary(church.id)}
                          disabled={setPrimaryMutation.isPending}
                          className="text-purple-600 border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                        >
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden xs:inline">Set As Primary</span>
                          <span className="xs:hidden">Set Primary</span>
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(church)}
                        disabled={disconnectMutation.isPending}
                        className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden xs:inline">Disconnect</span>
                        <span className="xs:hidden">Leave</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={disconnectDialog.open} onOpenChange={(open) => 
        setDisconnectDialog({ open, church: disconnectDialog.church })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Disconnect from Church?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect from <strong>{disconnectDialog.church?.name}</strong>? 
              This action cannot be undone and you'll lose access to church-specific features and content.
              {userChurches[0]?.id === disconnectDialog.church?.id && userChurches.length > 1 && (
                <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Primary Church</span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    This is your primary church. You'll be prompted to select a new primary church after disconnecting.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDisconnect}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Select New Primary Church Dialog */}
      <AlertDialog open={selectPrimaryDialog.open} onOpenChange={(open) => 
        setSelectPrimaryDialog({ open, churches: selectPrimaryDialog.churches })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Select New Primary Church</AlertDialogTitle>
            <AlertDialogDescription>
              You've disconnected from your primary church. Please select a new primary church from your remaining churches.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 my-4">
            {selectPrimaryDialog.churches.map((church) => (
              <div
                key={church.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={church.logoUrl} alt={church.name} />
                    <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-xs">
                      {church.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{church.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{church.city}, {church.state}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSetPrimary(church.id)}
                  disabled={setPrimaryMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Set As Primary
                </Button>
              </div>
            ))}
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}