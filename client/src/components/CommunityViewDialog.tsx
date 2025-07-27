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
      console.log('Fetching community details for ID:', communityId);
      const response = await fetch(`/api/communities/${communityId}`, { credentials: 'include' });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Community fetch error:', response.status, errorText);
        throw new Error(`Failed to fetch community details: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      console.log('Community data received:', data);
      return data;
    },
    enabled: isOpen && !!communityId,
    retry: 1,
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
    
    const links = [];
    if (getFieldValue(community.facebookUrl, community.facebook_url)) {
      links.push({ 
        platform: 'Facebook', 
        url: getFieldValue(community.facebookUrl, community.facebook_url), 
        icon: Facebook,
        color: 'text-blue-600' 
      });
    }
    if (getFieldValue(community.instagramUrl, community.instagram_url)) {
      links.push({ 
        platform: 'Instagram', 
        url: getFieldValue(community.instagramUrl, community.instagram_url), 
        icon: Instagram,
        color: 'text-pink-600' 
      });
    }
    if (getFieldValue(community.twitterUrl, community.twitter_url)) {
      links.push({ 
        platform: 'X/Twitter', 
        url: getFieldValue(community.twitterUrl, community.twitter_url), 
        icon: Twitter,
        color: 'text-blue-400' 
      });
    }
    if (getFieldValue(community.youtubeUrl, community.youtube_url)) {
      links.push({ 
        platform: 'YouTube', 
        url: getFieldValue(community.youtubeUrl, community.youtube_url), 
        icon: Youtube,
        color: 'text-red-600' 
      });
    }
    if (getFieldValue(community.tiktokUrl, community.tiktok_url)) {
      links.push({ 
        platform: 'TikTok', 
        url: getFieldValue(community.tiktokUrl, community.tiktok_url), 
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
            {(community.logoUrl || community.logo_url) ? (
              <div className="relative">
                <img 
                  src={community.logoUrl || community.logo_url} 
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
                {getFieldValue(community.establishedYear, community.established_year) && (
                  <Badge variant="outline" className="text-xs">
                    Est. {getFieldValue(community.establishedYear, community.established_year)}
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
          {(community.missionStatement || community.mission_statement || community.description) && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  About Us
                </h3>
              </CardHeader>
              <CardContent>
                {getFieldValue(community.missionStatement, community.mission_statement) && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mission Statement</h4>
                    <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                      {getFieldValue(community.missionStatement, community.mission_statement)}
                    </p>
                  </div>
                )}
                {community.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                    <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                      {community.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Service Times & Hours */}
          {(getFieldValue(community.worshipTimes, community.worship_times) || getFieldValue(community.officeHours, community.office_hours)) && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  Service Times & Hours
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {getFieldValue(community.worshipTimes, community.worship_times) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Worship Times</h4>
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-medium">
                        {getFieldValue(community.worshipTimes, community.worship_times)}
                      </pre>
                    </div>
                  </div>
                )}
                
                {getFieldValue(community.officeHours, community.office_hours) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Office Hours</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {getFieldValue(community.officeHours, community.office_hours)}
                      </p>
                    </div>
                  </div>
                )}
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
                  <p className="text-gray-900 dark:text-gray-100">
                    {getFieldValue(community.streetAddress, community.street_address) || community.address}
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {community.city}, {community.state} {getFieldValue(community.zipCode, community.zip_code)}
                  </p>
                </div>
                
                {/* Complete Address Display */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Complete Address</p>
                  <p className="text-gray-900 dark:text-gray-100 text-sm">
                    {[
                      getFieldValue(community.streetAddress, community.street_address) || community.address,
                      community.city,
                      community.state,
                      getFieldValue(community.zipCode, community.zip_code)
                    ].filter(Boolean).join(', ')}
                  </p>
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
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-gray-100">{community.phone}</span>
                  </div>
                )}
                
                {(community.email || getFieldValue(community.adminEmail, community.admin_email)) && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-gray-100">
                      {community.email || getFieldValue(community.adminEmail, community.admin_email)}
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
                    {getFieldValue(community.memberCount, community.member_count) || 1}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Members</p>
                </div>
                
                {getFieldValue(community.weeklyAttendance, community.weekly_attendance) && (
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {getFieldValue(community.weeklyAttendance, community.weekly_attendance)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Weekly Attendance</p>
                  </div>
                )}
                
                {getFieldValue(community.establishedYear, community.established_year) && (
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {getFieldValue(community.establishedYear, community.established_year)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Established</p>
                  </div>
                )}
                
                <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                    {community.type}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                </div>
              </div>
              
              {getFieldValue(community.parentChurch, community.parent_church) && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Parent Church</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {getFieldValue(community.parentChurch, community.parent_church)}
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