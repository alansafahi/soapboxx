import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { useToast } from "../hooks/use-toast";
import {
  Settings,
  MessageSquare,
  DollarSign,
  Headphones,
  Users,
  Calendar,
  Heart,
  VideoIcon,
  ImageIcon,
  MicIcon,
  TrendingUpIcon,
  BookOpen,
  Package
} from "lucide-react";

interface ChurchFeature {
  id: number;
  church_id: number;
  feature_category: string;
  feature_name: string;
  is_enabled: boolean;
  configuration: {
    priority: 'high' | 'medium' | 'low';
    description?: string;
  };
  enabled_by: string;
  enabled_at: string;
  last_modified: string;
}

interface ChurchFeatureManagerProps {
  churchId: number;
  userRole: string;
  communityType?: string;
}

// Community-type-specific feature definitions
const getFeatureDefinitions = (communityType: string = 'church'): Record<string, Record<string, any>> => {
  const baseFeatures: Record<string, Record<string, Record<string, any>>> = {
    // Church Features (full feature set)
    'church': {
      'community': {
        'donation': {
          name: 'Donation System',
          description: 'Accept donations and manage fundraising campaigns',
          icon: DollarSign,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          priority: 'high'
        },
        'events': {
          name: 'Event Management',
          description: 'Create and manage church events with RSVP tracking',
          icon: Calendar,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          priority: 'high'
        },
        'communication_hub': {
          name: 'Communication Hub',
          description: 'Send announcements and messages to members',
          icon: MessageSquare,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 dark:bg-purple-950/20',
          priority: 'high'
        }
      },
      'spiritual_tools': {
        'prayer_wall': {
          name: 'Prayer Wall',
          description: 'Community prayer requests and prayer circles',
          icon: Heart,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
          priority: 'high'
        },
        'audio_bible': {
          name: 'Audio Bible',
          description: 'Narrated Bible readings and study tools',
          icon: Headphones,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          priority: 'medium'
        },
        'audio_routines': {
          name: 'Audio Routines',
          description: 'Guided prayer and meditation sessions',
          icon: MicIcon,
          color: 'text-teal-600',
          bgColor: 'bg-teal-50 dark:bg-teal-950/20',
          priority: 'low'
        }
      },
      'media_contents': {
        'video_library': {
          name: 'Video Library',
          description: 'Manage and share sermon videos and content',
          icon: VideoIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          priority: 'low'
        },
        'image_gallery': {
          name: 'Image Gallery',
          description: 'Photo sharing and church media gallery',
          icon: ImageIcon,
          color: 'text-pink-600',
          bgColor: 'bg-pink-50 dark:bg-pink-950/20',
          priority: 'low'
        }
      },
      'admin_features': {
        'sermon_studio': {
          name: 'Content Creation',
          description: 'AI-powered sermon creation and biblical research',
          icon: MicIcon,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 dark:bg-amber-950/20',
          priority: 'medium'
        },
        'engagement_analytics': {
          name: 'Engagement Analytics',
          description: 'Track member engagement and church growth metrics',
          icon: TrendingUpIcon,
          color: 'text-violet-600',
          bgColor: 'bg-violet-50 dark:bg-violet-950/20',
          priority: 'medium'
        }
      }
    },
    
    // Group Features (Bible Studies, Support Groups, etc.)
    'group': {
      'community': {
        'events': {
          name: 'Meeting Management',
          description: 'Schedule group meetings and activities',
          icon: Calendar,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          priority: 'high'
        },
        'communication_hub': {
          name: 'Group Communication',
          description: 'Send updates and messages to group members',
          icon: MessageSquare,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 dark:bg-purple-950/20',
          priority: 'high'
        }
      },
      'group_tools': {
        'resource_sharing': {
          name: 'Resource Sharing',
          description: 'Share study materials and group resources',
          icon: BookOpen,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          priority: 'medium'
        },
        'member_directory': {
          name: 'Member Directory',
          description: 'Connect with other group members',
          icon: Users,
          color: 'text-slate-600',
          bgColor: 'bg-slate-50 dark:bg-slate-950/20',
          priority: 'medium'
        }
      },
      'media_contents': {
        'image_gallery': {
          name: 'Photo Gallery',
          description: 'Share group photos and memories',
          icon: ImageIcon,
          color: 'text-pink-600',
          bgColor: 'bg-pink-50 dark:bg-pink-950/20',
          priority: 'low'
        }
      }
    },
    
    // Ministry Features (specific ministry functions)
    'ministry': {
      'community': {
        'events': {
          name: 'Ministry Events',
          description: 'Organize ministry activities and outreach',
          icon: Calendar,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          priority: 'high'
        },
        'communication_hub': {
          name: 'Team Communication',
          description: 'Send updates to ministry team and volunteers',
          icon: MessageSquare,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 dark:bg-purple-950/20',
          priority: 'high'
        }
      },
      'ministry_tools': {
        'volunteer_management': {
          name: 'Volunteer Management',
          description: 'Recruit and coordinate ministry volunteers',
          icon: Users,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          priority: 'high'
        },
        'resource_management': {
          name: 'Resource Management',
          description: 'Track ministry resources and equipment',
          icon: Package,
          color: 'text-teal-600',
          bgColor: 'bg-teal-50 dark:bg-teal-950/20',
          priority: 'medium'
        },
        'impact_tracking': {
          name: 'Impact Tracking',
          description: 'Measure ministry effectiveness and outcomes',
          icon: TrendingUpIcon,
          color: 'text-violet-600',
          bgColor: 'bg-violet-50 dark:bg-violet-950/20',
          priority: 'medium'
        }
      },
      'funding': {
        'donation': {
          name: 'Ministry Funding',
          description: 'Accept donations for ministry projects',
          icon: DollarSign,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          priority: 'low'
        }
      }
    }
  };

  return baseFeatures[communityType] || baseFeatures['church'];
};

export function ChurchFeatureManager({ churchId, userRole, communityType = 'church' }: ChurchFeatureManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get feature definitions for this community type
  const featureDefinitions = getFeatureDefinitions(communityType);

  // Get church features
  const { data: features, isLoading, refetch } = useQuery<ChurchFeature[]>({
    queryKey: ['church-features', churchId],
    queryFn: async () => {
      const response = await fetch(`/api/churches/${churchId}/features`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch church features');
      return response.json();
    },
  });

  // Auto-initialize features if none exist
  const initializeFeaturesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/churches/${churchId}/features/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ churchSize: 'small' })
      });
      if (!response.ok) throw new Error('Failed to initialize features');
      return response.json();
    },
    onSuccess: () => {
      refetch(); // Refresh the features list
      toast({
        title: "Features Initialized",
        description: `${communityType === 'church' ? 'Church' : communityType === 'group' ? 'Group' : 'Ministry'} features have been set up with default settings.`,
      });
    },
    onError: () => {
      toast({
        title: "Initialization Failed",
        description: "Unable to set up default features. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Auto-initialize if no features found and not loading
  useEffect(() => {
    if (!isLoading && features && features.length === 0 && hasAdminAccess()) {
      initializeFeaturesMutation.mutate();
    }
  }, [isLoading, features]);

  // Update feature mutation
  const updateFeatureMutation = useMutation({
    mutationFn: async ({ featureId, isEnabled }: { featureId: number; isEnabled: boolean }) => {
      const response = await fetch(`/api/churches/features/${featureId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isEnabled }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update feature: ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['church-features', churchId] });
      queryClient.invalidateQueries({ queryKey: ['user-churches'] });
      toast({
        title: "Feature Updated",
        description: "Church feature has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update church feature.",
        variant: "destructive"
      });
    },
  });

  const handleFeatureToggle = (feature: ChurchFeature) => {
    updateFeatureMutation.mutate({
      featureId: feature.id,
      isEnabled: !feature.is_enabled
    });
  };

  // Check if user has admin access
  const hasAdminAccess = () => {
    const adminRoles = ['church_admin', 'owner', 'soapbox_owner', 'pastor', 'lead-pastor', 'system-admin'];
    return adminRoles.includes(userRole);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading features...</p>
        </CardContent>
      </Card>
    );
  }



  if (!hasAdminAccess()) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Admin Access Required
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            You need admin permissions to manage church features.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Create a flat lookup of all features by name (not categorized)
  const featureLookup = features?.reduce((acc, feature) => {
    acc[feature.feature_name] = feature;
    return acc;
  }, {} as Record<string, ChurchFeature>) || {};
  


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Feature Configuration
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {communityType === 'church' 
              ? 'Enable or disable SoapBox features for your church. Changes take effect immediately for all members.'
              : communityType === 'group'
              ? 'Enable or disable SoapBox features for your group. Changes take effect immediately for all group members.'
              : 'Enable or disable SoapBox features for your ministry. Changes take effect immediately for all ministry participants.'
            }
          </p>
        </CardHeader>
      </Card>

      {Object.entries(getFeatureDefinitions(communityType)).map(([categoryKey, categoryFeatures]: [string, any]) => {
        const categoryName = categoryKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

        return (
          <Card key={categoryKey}>
            <CardHeader>
              <CardTitle className="text-lg">
                {categoryName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryFeatures).map(([featureKey, featureDefinition]: [string, any]) => {
                  const feature = featureLookup[featureKey];
                  const IconComponent = featureDefinition.icon;
                  
                  return (
                    <div 
                      key={featureKey}
                      className={`p-4 rounded-lg border ${featureDefinition.bgColor} ${
                        feature?.is_enabled ? 'border-green-200 dark:border-green-800' : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm`}>
                            <IconComponent className={`w-5 h-5 ${featureDefinition.color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {featureDefinition.name}
                              </h4>
                              <Badge 
                                variant={featureDefinition.priority === 'high' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {featureDefinition.priority} priority
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {featureDefinition.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={feature?.is_enabled ? 'default' : 'outline'}>
                            {feature?.is_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          <Switch
                            checked={feature?.is_enabled || false}
                            onCheckedChange={() => {
                              if (feature) {
                                handleFeatureToggle(feature);
                              }
                            }}
                            disabled={updateFeatureMutation.isPending || !feature}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardContent className="text-center py-6">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <p className="mb-2">
              <strong>Core Features:</strong> Home, Messages, Contacts, S.O.A.P. Journal, Engagement Board, Profile, and Settings are always available.
            </p>
            <p>
              {communityType === 'church' 
                ? 'Feature changes apply to all church members immediately and affect navigation menu visibility.'
                : communityType === 'group'
                ? 'Feature changes apply to all group members immediately and affect navigation menu visibility.'
                : 'Feature changes apply to all ministry participants immediately and affect navigation menu visibility.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChurchFeatureManager;