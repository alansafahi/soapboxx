import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Church, 
  Calendar, 
  MessageSquare, 
  DollarSign, 
  Heart, 
  Headphones, 
  Music, 
  Video, 
  Image, 
  Mic,
  CheckCircle,
  Settings,
  Sparkles
} from 'lucide-react';
import { useUpdateFeature } from '../hooks/useChurchFeatures';

interface FeatureConfig {
  category: string;
  name: string;
  displayName: string;
  description: string;
  icon: React.ComponentType<any>;
  priority: 'high' | 'medium' | 'low';
  defaultEnabled: boolean;
  recommendedFor: string[];
}

const CONFIGURABLE_FEATURES: FeatureConfig[] = [
  { 
    category: 'community', 
    name: 'churches', 
    displayName: 'Church Discovery', 
    description: 'Allow members to discover and connect with other churches',
    icon: Church,
    priority: 'high',
    defaultEnabled: true,
    recommendedFor: ['all']
  },
  { 
    category: 'community', 
    name: 'events', 
    displayName: 'Event Management', 
    description: 'Create and manage church events with RSVP system',
    icon: Calendar,
    priority: 'high',
    defaultEnabled: true,
    recommendedFor: ['all']
  },
  { 
    category: 'community', 
    name: 'discussions', 
    displayName: 'Community Discussions', 
    description: 'Church-wide discussion forums and social feed',
    icon: MessageSquare,
    priority: 'high',
    defaultEnabled: true,
    recommendedFor: ['all']
  },
  { 
    category: 'community', 
    name: 'donation', 
    displayName: 'Digital Donations', 
    description: 'Integrated donation processing and giving tracking',
    icon: DollarSign,
    priority: 'medium',
    defaultEnabled: true,
    recommendedFor: ['small', 'medium']
  },
  { 
    category: 'spiritual_tools', 
    name: 'prayer_wall', 
    displayName: 'Prayer Wall', 
    description: 'Public prayer requests and prayer circle management',
    icon: Heart,
    priority: 'high',
    defaultEnabled: true,
    recommendedFor: ['all']
  },
  { 
    category: 'spiritual_tools', 
    name: 'audio_bible', 
    displayName: 'Audio Bible', 
    description: 'Built-in Bible audio with multiple translations',
    icon: Headphones,
    priority: 'medium',
    defaultEnabled: true,
    recommendedFor: ['all']
  },
  { 
    category: 'spiritual_tools', 
    name: 'audio_routines', 
    displayName: 'Audio Routines', 
    description: 'Guided meditation and prayer routines',
    icon: Music,
    priority: 'low',
    defaultEnabled: true,
    recommendedFor: ['all']
  },
  { 
    category: 'media_contents', 
    name: 'video_library', 
    displayName: 'Video Library', 
    description: 'Church video content and sermon archive',
    icon: Video,
    priority: 'low',
    defaultEnabled: true,
    recommendedFor: ['all']
  },
  { 
    category: 'media_contents', 
    name: 'image_gallery', 
    displayName: 'Image Gallery', 
    description: 'Church photo gallery and visual content sharing',
    icon: Image,
    priority: 'low',
    defaultEnabled: true,
    recommendedFor: ['all']
  },
  { 
    category: 'admin_portal', 
    name: 'communication_hub', 
    displayName: 'Communication Hub', 
    description: 'Mass messaging and communication templates',
    icon: MessageSquare,
    priority: 'high',
    defaultEnabled: true,
    recommendedFor: ['all']
  },
  { 
    category: 'admin_portal', 
    name: 'sermon_studio', 
    displayName: 'Content Creation', 
    description: 'AI-powered sermon creation and research tools',
    icon: Mic,
    priority: 'medium',
    defaultEnabled: true,
    recommendedFor: ['all']
  },
];

interface ChurchFeatureSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  churchId: number;
  churchName: string;
  churchSize?: string;
}

export default function ChurchFeatureSetupDialog({ 
  isOpen, 
  onClose, 
  churchId, 
  churchName, 
  churchSize = 'small' 
}: ChurchFeatureSetupDialogProps) {
  const { toast } = useToast();
  const [features, setFeatures] = useState<Record<string, boolean>>(() => {
    // Initialize all features as enabled by default - churches can turn off what they don't need
    const initialFeatures: Record<string, boolean> = {};
    CONFIGURABLE_FEATURES.forEach(feature => {
      initialFeatures[`${feature.category}-${feature.name}`] = feature.defaultEnabled;
    });
    return initialFeatures;
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateFeature = useUpdateFeature(churchId);

  const handleFeatureToggle = (category: string, name: string, enabled: boolean) => {
    const key = `${category}-${name}`;
    setFeatures(prev => ({ ...prev, [key]: enabled }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // First ensure features are initialized for this church
      try {
        await fetch(`/api/church/${churchId}/features/initialize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ churchSize }),
        });
      } catch (initError) {
        // Continue even if initialization fails (features might already exist)
        // Feature initialization warning - silent error handling
      }

      // Update all feature settings
      const updatePromises = CONFIGURABLE_FEATURES.map(async feature => {
        const key = `${feature.category}-${feature.name}`;
        const isEnabled = features[key];
        
        try {
          return await updateFeature.mutateAsync({
            category: feature.category,
            featureName: feature.name,
            data: { 
              isEnabled,
              configuration: { 
                priority: feature.priority,
                setupMethod: 'wizard'
              }
            }
          });
        } catch (featureError) {
          // Failed to update feature - silent error handling
          return null;
        }
      });

      await Promise.all(updatePromises);
      
      toast({
        title: "Features Configured",
        description: `${churchName} features have been set up successfully!`,
      });
      
      onClose();
    } catch (error) {
      // Feature configuration error - silent error handling
      toast({
        title: "Configuration Failed",
        description: "Failed to configure features. You can adjust them later in the admin portal.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationText = (feature: FeatureConfig) => {
    return feature.defaultEnabled ? 'Enabled by default - turn off if not needed' : 'Available to enable if desired';
  };

  const enabledCount = Object.values(features).filter(Boolean).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Configure SoapBox Features for {churchName}
          </DialogTitle>
          <DialogDescription>
            All SoapBox features are enabled by default. Disable any features you already have solutions for or don't want your members to see.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900 dark:text-blue-100">Feature Configuration Approach</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              All features start enabled to give you full SoapBox functionality. Turn off features you already have solutions for 
              or don't want visible to your members. You can always adjust these settings later in the admin portal.
            </p>
          </div>

          <div className="grid gap-4">
            {CONFIGURABLE_FEATURES.map(feature => {
              const FeatureIcon = feature.icon;
              const key = `${feature.category}-${feature.name}`;
              const isEnabled = features[key];
              const isRecommended = feature.recommendedFor.includes(churchSize) || feature.recommendedFor.includes('all');
              
              return (
                <Card key={key} className={`transition-all ${isEnabled ? 'ring-2 ring-blue-200' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <FeatureIcon className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{feature.displayName}</h3>
                            <Badge variant="outline" className={getPriorityColor(feature.priority)}>
                              {feature.priority}
                            </Badge>
                            {feature.defaultEnabled && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Default On
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{feature.description}</p>
                          <p className="text-xs text-muted-foreground">{getRecommendationText(feature)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEnabled && <CheckCircle className="h-4 w-4 text-green-600" />}
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) => handleFeatureToggle(feature.category, feature.name, checked)}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {enabledCount} of {CONFIGURABLE_FEATURES.length} features enabled
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Skip Setup
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Configuring...' : 'Configure Features'}
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Core Features (Always Available)</h4>
            <p className="text-sm text-muted-foreground mb-2">
              These essential features are always enabled and cannot be disabled:
            </p>
            <div className="flex flex-wrap gap-2">
              {['Home', 'Messages', 'Contacts', 'Engagement Board', 'Profile', 'Settings', 'S.O.A.P. Journal'].map(feature => (
                <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}