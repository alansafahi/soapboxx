import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  Calendar,
  Settings,
  Eye,
  ExternalLink
} from "lucide-react";

interface CommunityViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  userRole?: string;
}

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

export function CommunityViewDialog({ 
  isOpen, 
  onClose, 
  communityId, 
  userRole 
}: CommunityViewDialogProps) {
  // Get community details
  const { data: community, isLoading } = useQuery({
    queryKey: ['community-details', communityId],
    queryFn: async () => {
      const response = await fetch(`/api/churches/${communityId}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch community details');
      }
      return response.json() as CommunityProfile;
    },
    enabled: isOpen && !!communityId,
  });

  // Check if user has admin access
  const hasAdminAccess = () => {
    const adminRoles = ['church_admin', 'church-admin', 'admin', 'pastor', 'lead-pastor', 'elder', 'soapbox_owner'];
    return adminRoles.includes(userRole || '');
  };

  const handleAdminAccess = () => {
    // Redirect to Admin Portal Community Admin tab
    window.location.href = `/admin?tab=community-admin&communityId=${communityId}`;
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading community details...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!community) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Community Not Found</h3>
            <p className="text-gray-600">Unable to load community information.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {community.logoUrl ? (
                <img 
                  src={community.logoUrl} 
                  alt={`${community.name} logo`}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <Building2 className="h-10 w-10 text-blue-600" />
              )}
              <div>
                <h2 className="text-xl font-bold">{community.name}</h2>
                <div className="flex items-center space-x-2">
                  <Badge variant={community.type === 'church' ? 'default' : community.type === 'group' ? 'secondary' : 'outline'}>
                    {community.type.charAt(0).toUpperCase() + community.type.slice(1)}
                  </Badge>
                  {community.denomination && (
                    <Badge variant="outline" className="text-xs">
                      {community.denomination}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {hasAdminAccess() && (
                <Button 
                  onClick={handleAdminAccess}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Settings className="h-4 w-4" />
                  <span>Manage</span>
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Community Description */}
          {(community.description || community.bio) && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {community.description || community.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="space-y-3">
                {/* Address */}
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {community.address}
                      <br />
                      {community.city}, {community.state} {community.zipCode}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                {community.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        <a 
                          href={`tel:${community.phone}`} 
                          className="hover:text-blue-600 transition-colors"
                        >
                          {community.phone}
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                {/* Email */}
                {community.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        <a 
                          href={`mailto:${community.email}`} 
                          className="hover:text-blue-600 transition-colors"
                        >
                          {community.email}
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                {/* Website */}
                {community.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Website</p>
                      <p className="text-gray-600 dark:text-gray-300">
                        <a 
                          href={community.website.startsWith('http') ? community.website : `https://${community.website}`}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="hover:text-blue-600 transition-colors flex items-center space-x-1"
                        >
                          <span>{community.website}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Community Stats */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Community Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Members</p>
                    <p className="text-gray-600 dark:text-gray-300">{community.memberCount || 0}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Type</p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {community.type.charAt(0).toUpperCase() + community.type.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <Eye className="h-4 w-4 mr-2" />
              Close
            </Button>
            {!hasAdminAccess() && (
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Join Community
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}