import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Users, 
  Heart, 
  Video, 
  MessageSquare, 
  DollarSign, 
  Church, 
  Calendar,
  BookOpen,
  Headphones,
  Music,
  Image,
  Shield,
  Mic,
  BarChart3,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useChurchFeatures, useUpdateFeature, useInitializeChurchFeatures } from '../hooks/useChurchFeatures';

interface FeatureConfig {
  category: string;
  name: string;
  displayName: string;
  description: string;
  icon: React.ComponentType<any>;
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[];
}

const TOGGLEABLE_FEATURES: FeatureConfig[] = [
  // Community Features
  { category: 'community', name: 'churches', displayName: 'Church Discovery', description: 'Allow members to discover and connect with other churches', icon: Church, priority: 'high' },
  { category: 'community', name: 'events', displayName: 'Event Management', description: 'Create and manage church events with RSVP system', icon: Calendar, priority: 'high' },
  { category: 'community', name: 'discussions', displayName: 'Community Discussions', description: 'Church-wide discussion forums and social feed', icon: MessageSquare, priority: 'high' },
  { category: 'community', name: 'donation', displayName: 'Digital Donations', description: 'Integrated donation processing and giving tracking', icon: DollarSign, priority: 'medium' },
  
  // Spiritual Tools Features
  { category: 'spiritual_tools', name: 'prayer_wall', displayName: 'Prayer Wall', description: 'Public prayer requests and prayer circle management', icon: Heart, priority: 'high' },
  { category: 'spiritual_tools', name: 'audio_bible', displayName: 'Audio Bible', description: 'Built-in Bible audio with multiple translations', icon: Headphones, priority: 'medium' },
  { category: 'spiritual_tools', name: 'audio_routines', displayName: 'Audio Routines', description: 'Guided meditation and prayer routines', icon: Music, priority: 'low' },
  
  // Media Contents Features
  { category: 'media_contents', name: 'video_library', displayName: 'Video Library', description: 'Church video content and sermon archive', icon: Video, priority: 'low' },
  { category: 'media_contents', name: 'image_gallery', displayName: 'Image Gallery', description: 'Church photo gallery and visual content sharing', icon: Image, priority: 'low' },
  
  // Admin Portal Features
  { category: 'admin_portal', name: 'communication_hub', displayName: 'Communication Hub', description: 'Mass messaging and communication templates', icon: MessageSquare, priority: 'high' },
  { category: 'admin_portal', name: 'sermon_studio', displayName: 'Sermon Studio', description: 'AI-powered sermon creation and research tools', icon: Mic, priority: 'medium' },
];

const CORE_FEATURES = [
  'Home', 'Messages', 'Contacts', 'Engagement Board', 'Profile', 'Settings'
];

interface ChurchFeatureManagerProps {
  churchId: number;
  userRole: string;
}

export default function ChurchFeatureManager({ churchId, userRole }: ChurchFeatureManagerProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('community');
  
  const { data: features, isLoading, error } = useChurchFeatures(churchId);
  const updateFeature = useUpdateFeature(churchId);
  const initializeFeatures = useInitializeChurchFeatures(churchId);

  const hasAdminAccess = ['church_admin', 'owner', 'soapbox_owner'].includes(userRole);

  const handleFeatureToggle = async (category: string, featureName: string, isEnabled: boolean) => {
    if (!hasAdminAccess) {
      toast({
        title: "Access Denied",
        description: "Only church administrators can modify feature settings.",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateFeature.mutateAsync({
        category,
        featureName,
        data: { isEnabled }
      });
      
      toast({
        title: "Feature Updated",
        description: `${featureName} has been ${isEnabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update feature setting. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInitializeFeatures = async (churchSize: string) => {
    try {
      await initializeFeatures.mutateAsync(churchSize);
      toast({
        title: "Features Initialized",
        description: `Church features have been initialized for ${churchSize} church size.`,
      });
    } catch (error) {
      toast({
        title: "Initialization Failed",
        description: "Failed to initialize features. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getFeatureStatus = (category: string, name: string): boolean => {
    if (!features) return true; // Default to enabled if no settings
    
    const setting = features.find(f => f.featureCategory === category && f.featureName === name);
    return setting?.isEnabled ?? true;
  };

  const getCategorizedFeatures = (category: string) => {
    return TOGGLEABLE_FEATURES.filter(f => f.category === category);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load church feature settings. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Church Feature Management
          </CardTitle>
          <CardDescription>
            Configure which SoapBox features are available to your church members.
            Disable features you already have solutions for to avoid confusion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasAdminAccess && (
            <Alert className="mb-4">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                You have read-only access to feature settings. Contact your church administrator to make changes.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="community">Community</TabsTrigger>
              <TabsTrigger value="spiritual_tools">Spiritual Tools</TabsTrigger>
              <TabsTrigger value="media_contents">Media</TabsTrigger>
              <TabsTrigger value="admin_portal">Admin</TabsTrigger>
            </TabsList>

            {['community', 'spiritual_tools', 'media_contents', 'admin_portal'].map(category => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="grid gap-4">
                  {getCategorizedFeatures(category).map(feature => {
                    const FeatureIcon = feature.icon;
                    const isEnabled = getFeatureStatus(feature.category, feature.name);
                    
                    return (
                      <Card key={`${feature.category}-${feature.name}`} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FeatureIcon className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{feature.displayName}</h3>
                                <Badge variant="outline" className={getPriorityColor(feature.priority)}>
                                  {feature.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isEnabled ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-gray-400" />
                            )}
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(checked) => handleFeatureToggle(feature.category, feature.name, checked)}
                              disabled={!hasAdminAccess || updateFeature.isPending}
                            />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium mb-2">Core Features (Always Available)</h3>
            <p className="text-sm text-muted-foreground mb-3">
              These essential features cannot be disabled and are always available to your members.
            </p>
            <div className="flex flex-wrap gap-2">
              {CORE_FEATURES.map(feature => (
                <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          {hasAdminAccess && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-2">Quick Setup</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Initialize feature settings based on your church size for optimal configuration.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleInitializeFeatures('small')}
                  disabled={initializeFeatures.isPending}
                >
                  Small Church (&lt;100)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleInitializeFeatures('medium')}
                  disabled={initializeFeatures.isPending}
                >
                  Medium Church (100-499)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleInitializeFeatures('large')}
                  disabled={initializeFeatures.isPending}
                >
                  Large Church (500-1999)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleInitializeFeatures('mega')}
                  disabled={initializeFeatures.isPending}
                >
                  Mega Church (2000+)
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}