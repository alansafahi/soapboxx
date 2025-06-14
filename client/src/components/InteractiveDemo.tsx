import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Play, 
  Pause, 
  SkipForward, 
  X, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Eye,
  Hand,
  Target,
  BookOpen,
  Users,
  Settings,
  BarChart3,
  MessageSquare,
  Calendar,
  Heart
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DemoStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'scroll' | 'input';
  content?: string;
  icon?: string;
  duration?: number;
  screenshot?: string;
  videoUrl?: string;
}

interface DemoTour {
  id: string;
  title: string;
  description: string;
  role: string;
  estimatedTime: number;
  steps: DemoStep[];
  category: 'onboarding' | 'feature' | 'advanced';
}

const DEMO_TOURS: DemoTour[] = [
  {
    id: 'pastor-onboarding',
    title: 'Pastor Welcome Tour',
    description: 'Complete guide to sermon creation, publishing, and analytics',
    role: 'pastor',
    estimatedTime: 8,
    category: 'onboarding',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to SoapBox',
        description: 'Your comprehensive faith-based platform for sermon creation and community engagement',
        target: '.dashboard-header',
        position: 'bottom',
        icon: 'BookOpen',
        duration: 3000,
        screenshot: '/attached_assets/Screenshot%202025-06-13%20at%201.00.53%20AM_1749801661635.png'
      },
      {
        id: 'sermon-creation',
        title: 'Create Your First Sermon',
        description: 'Click here to access AI-powered sermon creation tools with intelligent research and outline generation',
        target: '[data-tour="sermon-creation"]',
        position: 'right',
        action: 'click',
        icon: 'BookOpen',
        screenshot: '/attached_assets/Screenshot%202025-06-13%20at%201.06.25%20AM_1749801989165.png'
      },
      {
        id: 'content-library',
        title: 'Content Library',
        description: 'Access your sermon library, weekly series, and devotionals all in one place',
        target: '[data-tour="content-tab"]',
        position: 'bottom',
        action: 'hover',
        icon: 'Archive',
        screenshot: '/attached_assets/Screenshot%202025-06-13%20at%201.08.32%20AM_1749802115963.png'
      },
      {
        id: 'social-publishing',
        title: 'Social Media Publishing',
        description: 'Publish your sermons across 11 social platforms with automated scheduling',
        target: '[data-tour="social-publish"]',
        position: 'left',
        action: 'click',
        icon: 'Share2',
        screenshot: undefined
      },
      {
        id: 'analytics-dashboard',
        title: 'Performance Analytics',
        description: 'Track engagement, reach, and impact of your published content',
        target: '[data-tour="analytics-tab"]',
        position: 'bottom',
        action: 'click',
        icon: 'BarChart3',
        screenshot: undefined
      }
    ]
  },
  {
    id: 'church-admin-tour',
    title: 'Church Admin Overview',
    description: 'Master church management, member oversight, and event coordination',
    role: 'church_admin',
    estimatedTime: 6,
    category: 'onboarding',
    steps: [
      {
        id: 'dashboard-overview',
        title: 'Admin Dashboard',
        description: 'Your central hub for church management and member oversight',
        target: '.admin-dashboard',
        position: 'bottom',
        icon: 'Settings',
        screenshot: undefined
      },
      {
        id: 'member-management',
        title: 'Member Management',
        description: 'Add, edit, and track church members with detailed profiles and engagement history',
        target: '[data-tour="member-management"]',
        position: 'right',
        action: 'click',
        icon: 'Users',
        screenshot: undefined
      },
      {
        id: 'event-coordination',
        title: 'Event Management',
        description: 'Create and manage church events, track attendance, and send notifications',
        target: '[data-tour="event-management"]',
        position: 'left',
        action: 'click',
        icon: 'Calendar',
        screenshot: '/attached_assets/Screenshot%202025-06-13%20at%201.21.56%20AM_1749802921679.png'
      },
      {
        id: 'prayer-wall',
        title: 'Prayer Wall Administration',
        description: 'Moderate prayer requests and manage community prayer support',
        target: '[data-tour="prayer-wall"]',
        position: 'bottom',
        action: 'hover',
        icon: 'Heart',
        screenshot: '/attached_assets/Screenshot%202025-06-13%20at%201.22.13%20AM_1749802937236.png'
      }
    ]
  },
  {
    id: 'member-experience',
    title: 'Member Journey',
    description: 'Discover community features, daily devotionals, and spiritual growth tools',
    role: 'member',
    estimatedTime: 5,
    category: 'onboarding',
    steps: [
      {
        id: 'community-feed',
        title: 'Community Feed',
        description: 'Stay connected with your church community through shared prayers and updates',
        target: '[data-tour="community-feed"]',
        position: 'right',
        icon: 'MessageSquare',
        screenshot: '/attached_assets/Screenshot 2025-06-09 at 10.06.11 PM_1749531976072.png'
      },
      {
        id: 'daily-devotionals',
        title: 'Daily Devotionals',
        description: 'Access personalized daily devotionals and Bible study materials',
        target: '[data-tour="devotionals"]',
        position: 'bottom',
        action: 'click',
        icon: 'BookOpen',
        screenshot: '/attached_assets/Screenshot 2025-06-09 at 10.09.31 PM_1749532176078.png'
      },
      {
        id: 'prayer-requests',
        title: 'Prayer Requests',
        description: 'Submit prayer requests and support others in their spiritual journey',
        target: '[data-tour="prayer-submit"]',
        position: 'left',
        action: 'click',
        icon: 'Heart',
        screenshot: '/attached_assets/Screenshot 2025-06-09 at 10.14.40 PM_1749532485669.png'
      },
      {
        id: 'events-participation',
        title: 'Church Events',
        description: 'View upcoming events and RSVP for church activities',
        target: '[data-tour="events-list"]',
        position: 'top',
        action: 'hover',
        icon: 'Calendar',
        screenshot: '/attached_assets/Screenshot 2025-06-09 at 10.18.42 PM_1749532726639.png'
      }
    ]
  }
];

interface InteractiveDemoProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  forceTour?: string;
}

export function InteractiveDemo({ isOpen, onClose, userRole, forceTour }: InteractiveDemoProps) {
  const [currentTour, setCurrentTour] = useState<DemoTour | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [showHotspot, setShowHotspot] = useState(false);
  const [hotspotPosition, setHotspotPosition] = useState({ x: 0, y: 0 });
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (forceTour) {
      const tour = DEMO_TOURS.find(t => t.id === forceTour);
      if (tour) {
        setCurrentTour(tour);
        setCurrentStep(0);
      }
    }
  }, [forceTour]);

  const availableTours = DEMO_TOURS.filter(tour => 
    !userRole || tour.role === userRole || tour.role === 'member'
  );

  const startTour = (tour: DemoTour) => {
    setCurrentTour(tour);
    setCurrentStep(0);
    setIsPlaying(true);
    trackDemoProgress('tour_started', tour.id);
  };

  const nextStep = () => {
    if (!currentTour) return;
    
    if (currentStep < currentTour.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      showInteractiveHotspot(currentTour.steps[currentStep + 1]);
    } else {
      completeTour();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      showInteractiveHotspot(currentTour.steps[currentStep - 1]);
    }
  };

  const completeTour = async () => {
    if (!currentTour) return;
    
    setCompleted(prev => [...prev, currentTour.id]);
    setIsPlaying(false);
    setShowHotspot(false);
    trackDemoProgress('tour_completed', currentTour.id);
    
    // Mark tour as completed on server to dismiss "New" badge
    try {
      await apiRequest('/api/tour/complete', {
        method: 'POST',
        body: { tourId: currentTour.id, userRole }
      });
      // Invalidate tour status to refresh the badge visibility
      queryClient.invalidateQueries({ queryKey: ['/api/tour/status'] });
    } catch (error) {
      console.error('Failed to mark tour as completed:', error);
    }
    
    toast({
      title: "Tour Completed!",
      description: `You've finished the ${currentTour.title}. Great job!`,
    });
    
    setCurrentTour(null);
    setCurrentStep(0);
  };

  const showInteractiveHotspot = (step: DemoStep) => {
    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      const position = calculateHotspotPosition(rect, step.position);
      setHotspotPosition(position);
      setShowHotspot(true);
      
      // Auto-advance for timed steps
      if (step.duration && isPlaying) {
        intervalRef.current = setTimeout(() => {
          nextStep();
        }, step.duration);
      }
    }
  };

  const calculateHotspotPosition = (rect: DOMRect, position: string) => {
    const offset = 20;
    switch (position) {
      case 'top':
        return { x: rect.left + rect.width / 2, y: rect.top - offset };
      case 'bottom':
        return { x: rect.left + rect.width / 2, y: rect.bottom + offset };
      case 'left':
        return { x: rect.left - offset, y: rect.top + rect.height / 2 };
      case 'right':
        return { x: rect.right + offset, y: rect.top + rect.height / 2 };
      default:
        return { x: rect.left + rect.width / 2, y: rect.bottom + offset };
    }
  };

  const trackDemoProgress = async (action: string, tourId: string) => {
    try {
      await apiRequest('/api/demo/track', {
        method: 'POST',
        body: {
          action,
          tourId,
          stepId: currentTour?.steps[currentStep]?.id,
          userId: user?.id,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error tracking demo progress:', error);
    }
  };

  const pauseResumeTour = () => {
    setIsPlaying(!isPlaying);
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
  };

  const skipTour = () => {
    setIsPlaying(false);
    setShowHotspot(false);
    setCurrentTour(null);
    setCurrentStep(0);
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
  };

  useEffect(() => {
    if (currentTour && currentStep < currentTour.steps.length) {
      showInteractiveHotspot(currentTour.steps[currentStep]);
    }
    
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [currentStep, currentTour]);

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Interactive Demo Experience
            </DialogTitle>
            <DialogDescription>
              Choose a guided tour to explore SoapBox features with interactive walkthroughs
            </DialogDescription>
          </DialogHeader>

          {!currentTour ? (
            <div className="space-y-6">
              {/* Tour Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTours.map(tour => (
                  <Card 
                    key={tour.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      completed.includes(tour.id) ? 'border-green-200 bg-green-50' : ''
                    }`}
                    onClick={() => startTour(tour)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{tour.title}</CardTitle>
                        {completed.includes(tour.id) && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={tour.category === 'onboarding' ? 'default' : 'secondary'}>
                          {tour.category}
                        </Badge>
                        <span className="text-sm text-gray-500">{tour.estimatedTime} min</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{tour.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{tour.steps.length} steps</span>
                        <Button size="sm" variant="outline">
                          Start Tour
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Progress Overview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Your Progress</h3>
                <div className="flex items-center gap-2">
                  <Progress value={(completed.length / availableTours.length) * 100} className="flex-1" />
                  <span className="text-sm text-gray-600">
                    {completed.length} of {availableTours.length} completed
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Active Tour Interface */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{currentTour.title}</h3>
                  <p className="text-gray-600">{currentTour.description}</p>
                </div>
                <Button variant="outline" size="sm" onClick={skipTour}>
                  <X className="h-4 w-4 mr-1" />
                  Skip Tour
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Step {currentStep + 1} of {currentTour.steps.length}</span>
                  <span>{Math.round(((currentStep + 1) / currentTour.steps.length) * 100)}% complete</span>
                </div>
                <Progress value={((currentStep + 1) / currentTour.steps.length) * 100} />
              </div>

              {/* Current Step Content */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {currentTour.steps[currentStep].icon === 'BookOpen' && <BookOpen className="h-5 w-5 text-blue-600" />}
                      {currentTour.steps[currentStep].icon === 'Users' && <Users className="h-5 w-5 text-blue-600" />}
                      {currentTour.steps[currentStep].icon === 'Settings' && <Settings className="h-5 w-5 text-blue-600" />}
                      {currentTour.steps[currentStep].icon === 'BarChart3' && <BarChart3 className="h-5 w-5 text-blue-600" />}
                      {currentTour.steps[currentStep].icon === 'MessageSquare' && <MessageSquare className="h-5 w-5 text-blue-600" />}
                      {currentTour.steps[currentStep].icon === 'Calendar' && <Calendar className="h-5 w-5 text-blue-600" />}
                      {currentTour.steps[currentStep].icon === 'Heart' && <Heart className="h-5 w-5 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{currentTour.steps[currentStep].title}</h4>
                      <p className="text-gray-600 mb-4">{currentTour.steps[currentStep].description}</p>
                      
                      {/* Screenshot Display */}
                      {currentTour.steps[currentStep].screenshot && (
                        <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors relative group">
                          <img
                            src={currentTour.steps[currentStep].screenshot}
                            alt={`Screenshot for ${currentTour.steps[currentStep].title}`}
                            className="w-full h-48 object-cover object-top group-hover:scale-105 transition-transform"
                            onClick={() => setShowScreenshotModal(true)}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                            <div className="bg-white bg-opacity-90 px-2 py-1 rounded text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to enlarge
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {currentTour.steps[currentStep].action && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Hand className="h-4 w-4" />
                          Action required: {currentTour.steps[currentStep].action}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tour Controls */}
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={previousStep}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={pauseResumeTour}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>

                <Button onClick={nextStep}>
                  {currentStep === currentTour.steps.length - 1 ? 'Complete' : 'Next'}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Interactive Hotspot Overlay */}
      {showHotspot && currentTour && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: hotspotPosition.x,
            top: hotspotPosition.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="relative">
            {/* Pulsing dot */}
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-blue-600 rounded-full w-4 h-4"></div>
            
            {/* Tooltip */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px] pointer-events-auto">
              <div className="text-sm font-medium mb-1">
                {currentTour.steps[currentStep].title}
              </div>
              <div className="text-xs text-gray-600">
                {currentTour.steps[currentStep].description}
              </div>
              {currentTour.steps[currentStep].action && (
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  Click to {currentTour.steps[currentStep].action}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Screenshot Modal */}
      {showScreenshotModal && currentTour && currentTour.steps[currentStep].screenshot && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]" onClick={() => setShowScreenshotModal(false)}>
          <div className="relative max-w-6xl max-h-[90vh] p-4">
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={() => setShowScreenshotModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={currentTour.steps[currentStep].screenshot}
              alt={`Full screenshot for ${currentTour.steps[currentStep].title}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3">
              <h4 className="font-semibold text-sm">{currentTour.steps[currentStep].title}</h4>
              <p className="text-xs text-gray-600 mt-1">{currentTour.steps[currentStep].description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}