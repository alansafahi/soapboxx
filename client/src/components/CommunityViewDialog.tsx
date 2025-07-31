import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Separator } from "./ui/separator";
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
  ExternalLink,
  Clock,
  Heart,
  Share2,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MessageSquare
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
  zip_code?: string; // Database field mapping
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  logo_url?: string; // Database field mapping
  bio?: string;
  memberCount: number;
  member_count?: number; // Database field mapping
  role?: string;
  establishedYear?: string;
  established_year?: string; // Database field mapping
  weeklyAttendance?: string;
  weekly_attendance?: string; // Database field mapping
  adminEmail?: string;
  admin_email?: string; // Database field mapping
  adminPhone?: string;
  admin_phone?: string; // Database field mapping
  parentChurch?: string;
  parent_church?: string; // Database field mapping
  missionStatement?: string;
  mission_statement?: string; // Database field mapping
  facebookUrl?: string;
  facebook_url?: string; // Database field mapping
  instagramUrl?: string;
  instagram_url?: string; // Database field mapping
  twitterUrl?: string;
  twitter_url?: string; // Database field mapping
  tiktokUrl?: string;
  tiktok_url?: string; // Database field mapping
  youtubeUrl?: string;
  youtube_url?: string; // Database field mapping
  officeHours?: string;
  office_hours?: string; // Database field mapping
  worshipTimes?: string;
  worship_times?: string; // Database field mapping
  sundayServiceTime?: string;
  sunday_service_time?: string; // Database field mapping
  wednesdayServiceTime?: string;
  wednesday_service_time?: string; // Database field mapping
  additionalTimes?: string;
  additional_times?: string; // Database field mapping
  serviceLanguage?: string;
  service_language?: string; // Database field mapping
  streetAddress?: string;
  street_address?: string; // Database field mapping
  hideAddress?: boolean;
  hide_address?: boolean; // Database field mapping
  hidePhone?: boolean;
  hide_phone?: boolean; // Database field mapping
}

export function CommunityViewDialog({ 
  isOpen, 
  onClose, 
  communityId, 
  userRole 
}: CommunityViewDialogProps) {
  // Get community details
  const { data: community, isLoading, error } = useQuery({
    queryKey: ['community-details', communityId],
    queryFn: async () => {
      const response = await fetch(`/api/communities/${communityId}`, { credentials: 'include' });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch community details: ${response.status} ${errorText}`);
      }
      return response.json();
    },
    enabled: isOpen && !!communityId,
    retry: 1,
  });

  // Get campuses for this community
  const { data: campuses = [] } = useQuery({
    queryKey: ['community-campuses', communityId],
    queryFn: async () => {
      const response = await fetch(`/api/churches/${communityId}/campuses`, { credentials: 'include' });
      if (!response.ok) {
        // If campuses endpoint fails, return empty array
        return [];
      }
      return response.json();
    },
    enabled: isOpen && !!communityId,
    retry: false,
  });

  // Check if user has admin access
  const hasAdminAccess = () => {
    const adminRoles = ['church_admin', 'church-admin', 'admin', 'pastor', 'lead-pastor', 'elder', 'soapbox_owner'];
    return adminRoles.includes(userRole || '');
  };

  const handleAdminAccess = () => {
    // Redirect to Community Administration page
    window.location.href = `/community-administration?communityId=${communityId}`;
  };

  // Helper function to get field value with fallback
  const getFieldValue = (primary: any, fallback: any) => primary || fallback;

  // Helper function to format social media links
  const getSocialMediaLinks = () => {
    if (!community) return [];
    
    // Check if socialLinks is a JSON string and parse it
    let socialLinksData = {};
    if (community.socialLinks) {
      try {
        socialLinksData = typeof community.socialLinks === 'string' 
          ? JSON.parse(community.socialLinks) 
          : community.socialLinks;
      } catch (e) {

      }
    }
    
    const links = [];
    if (socialLinksData.facebook || community.facebookUrl) {
      links.push({ 
        platform: 'Facebook', 
        url: socialLinksData.facebook || community.facebookUrl, 
        icon: Facebook,
        color: 'text-blue-600' 
      });
    }
    if (socialLinksData.instagram || community.instagramUrl) {
      links.push({ 
        platform: 'Instagram', 
        url: socialLinksData.instagram || community.instagramUrl, 
        icon: Instagram,
        color: 'text-pink-600' 
      });
    }
    if (socialLinksData.twitter || community.twitterUrl) {
      links.push({ 
        platform: 'X/Twitter', 
        url: socialLinksData.twitter || community.twitterUrl, 
        icon: Twitter,
        color: 'text-blue-400' 
      });
    }
    if (socialLinksData.youtube || community.youtubeUrl) {
      links.push({ 
        platform: 'YouTube', 
        url: socialLinksData.youtube || community.youtubeUrl, 
        icon: Youtube,
        color: 'text-red-600' 
      });
    }
    if (socialLinksData.tiktok || community.tiktokUrl) {
      links.push({ 
        platform: 'TikTok', 
        url: socialLinksData.tiktok || community.tiktokUrl, 
        icon: MessageSquare,
        color: 'text-gray-800' 
      });
    }
    return links;
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading Community</DialogTitle>
            <DialogDescription>Fetching community details...</DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading community details...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || (!community && !isLoading)) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Community Not Found</DialogTitle>
            <DialogDescription>Unable to load community information.</DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Community Not Found</h3>
            <p className="text-gray-600">
              {error?.message || "Unable to load community information."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Community Profile
          </DialogTitle>
          <DialogDescription>
            View comprehensive community information including contact details, service times, and more.
          </DialogDescription>
        </DialogHeader>

        {/* Community Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
          <div className="flex items-center space-x-4">
            {/* Logo Display */}
            {community.logoUrl ? (
              <div className="relative">
                <img 
                  src={community.logoUrl} 
                  alt={`${community.name} logo`}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            )}
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{community.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={community.type === 'church' ? 'default' : community.type === 'group' ? 'secondary' : 'outline'}>
                  {community.type.charAt(0).toUpperCase() + community.type.slice(1)}
                </Badge>
                {community.denomination && (
                  <Badge variant="outline" className="text-xs">
                    {community.denomination}
                  </Badge>
                )}
                {community.createdAt && (
                  <Badge variant="outline" className="text-xs">
                    Joined {new Date(community.createdAt).getFullYear()}
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
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 p-1">
          {/* Mission Statement & Description */}
          {(community.bio || community.description) && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  About Us
                </h3>
              </CardHeader>
              <CardContent>
                {community.description && community.description !== '' && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                    <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                      {community.description}
                    </p>
                  </div>
                )}
                {community.bio && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mission Statement</h4>
                    <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                      {community.bio}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}



          {/* Multi-Campus Locations */}
          {campuses && campuses.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-purple-500" />
                  Campus Locations ({campuses.length + 1} total)
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Main Campus */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 flex items-center">
                      <Building2 className="h-4 w-4 mr-2" />
                      Main Campus
                    </h4>
                    <Badge variant="default" className="bg-blue-600">Main</Badge>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {community.address}, {community.city}, {community.state} {community.zipCode || ''}
                  </p>
                  {community.phone && (
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                      📞 {community.phone}
                    </p>
                  )}
                </div>

                {/* Additional Campuses */}
                {campuses.map((campus: any, index: number) => (
                  <div key={campus.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-gray-400">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        {campus.name || `Campus ${index + 1}`}
                      </h4>
                      <Badge variant="outline">Satellite</Badge>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {campus.address}
                      {campus.city && `, ${campus.city}`}
                      {campus.state && `, ${campus.state}`}
                      {campus.zipCode && ` ${campus.zipCode}`}
                    </p>
                    {campus.phone && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        📞 {campus.phone}
                      </p>
                    )}
                    {campus.campusAdminName && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        👤 Campus Admin: {campus.campusAdminName}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Location Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-green-500" />
                  Location Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</p>
                  {(community.hideAddress || community.hide_address) && !hasAdminAccess() ? (
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        Address is private. Contact this {community.type?.toLowerCase() || 'community'} directly for location details.
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-900 dark:text-gray-100">
                        {community.address}
                      </p>
                      <p className="text-gray-900 dark:text-gray-100">
                        {community.city}, {community.state} {community.zipCode || community.zip_code || ''}
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-purple-500" />
                  Contact Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {community.phone && (
                  (community.hidePhone || community.hide_phone) && !hasAdminAccess() ? (
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        Phone number is private. Contact via email for phone details.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900 dark:text-gray-100">{community.phone}</span>
                    </div>
                  )
                )}
                
                {(community.email || community.adminEmail) && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-gray-100">
                      {community.email || community.adminEmail}
                    </span>
                  </div>
                )}
                
                {community.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <a 
                      href={community.website.startsWith('http') ? community.website : `https://${community.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                    >
                      {community.website}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Service Times & Hours */}
          {(community.worshipTimes || community.officeHours || community.hoursOfOperation) && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  Service Times & Hours
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {community.worshipTimes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Worship Times</h4>
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-medium">
                        {community.worshipTimes}
                      </pre>
                    </div>
                  </div>
                )}
                
                {(community.officeHours || community.hoursOfOperation) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Office Hours</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {community.officeHours || (typeof community.hoursOfOperation === 'object' 
                          ? JSON.stringify(community.hoursOfOperation) 
                          : community.hoursOfOperation)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Social Media Links */}
          {getSocialMediaLinks().length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <Share2 className="h-5 w-5 mr-2 text-indigo-500" />
                  Social Media
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {getSocialMediaLinks().map((link, index) => {
                    const IconComponent = link.icon;
                    return (
                      <a
                        key={index}
                        href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <IconComponent className={`h-5 w-5 ${link.color}`} />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {link.platform}
                        </span>
                        <ExternalLink className="h-3 w-3 text-gray-500 ml-auto" />
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Community Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2 text-orange-500" />
                Community Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {community.memberCount || 1}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Members</p>
                </div>
                
                {community.size && (
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400 capitalize">
                      {community.size}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Size</p>
                  </div>
                )}
                
                {(community.establishedYear || community.established_year || community.createdAt) && (
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {community.establishedYear || community.established_year || new Date(community.createdAt).getFullYear()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Established Year</p>
                  </div>
                )}
                
                <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                    {community.type}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                </div>
              </div>
              
              {community.isDemo && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Demo Community</p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    This is a demonstration community for testing purposes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}