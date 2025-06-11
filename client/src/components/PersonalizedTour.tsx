import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Users, 
  Calendar, 
  Heart, 
  Settings,
  BarChart3,
  MessageSquare,
  BookOpen,
  Church,
  Shield,
  UserCheck,
  Target,
  Gift,
  Megaphone,
  Camera,
  Music,
  Gamepad2,
  Coffee
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  target?: string;
  action?: string;
  highlight?: string;
}

interface RoleTourConfig {
  role: string;
  displayName: string;
  welcomeMessage: string;
  steps: TourStep[];
  color: string;
}

const tourConfigs: RoleTourConfig[] = [
  {
    role: "pastor",
    displayName: "Pastor",
    welcomeMessage: "Welcome to SoapBox! As a pastor, you have access to powerful tools to shepherd your congregation and manage church operations.",
    color: "bg-purple-100 text-purple-800",
    steps: [
      {
        id: "dashboard",
        title: "Church Dashboard",
        description: "Monitor attendance, engagement metrics, and member activity from your central dashboard.",
        icon: BarChart3,
        target: "/",
        action: "View Dashboard"
      },
      {
        id: "members",
        title: "Member Management",
        description: "Manage member profiles, track spiritual growth, and assign ministry roles.",
        icon: Users,
        target: "/admin",
        action: "Manage Members"
      },
      {
        id: "prayers",
        title: "Prayer Wall",
        description: "Monitor and respond to prayer requests from your congregation.",
        icon: Heart,
        target: "/prayer",
        action: "View Prayers"
      },
      {
        id: "events",
        title: "Event Planning",
        description: "Create and manage church events, services, and special programs.",
        icon: Calendar,
        target: "/events",
        action: "Plan Events"
      },
      {
        id: "communications",
        title: "Church Communications",
        description: "Send announcements, newsletters, and targeted messages to your congregation.",
        icon: Megaphone,
        target: "/admin",
        action: "Send Messages"
      }
    ]
  },
  {
    role: "ministry_leader",
    displayName: "Ministry Leader",
    welcomeMessage: "Great to have you! As a ministry leader, you can coordinate your team and engage with participants effectively.",
    color: "bg-blue-100 text-blue-800",
    steps: [
      {
        id: "team",
        title: "Your Ministry Team",
        description: "View and coordinate with your ministry team members and volunteers.",
        icon: Users,
        target: "/",
        action: "View Team"
      },
      {
        id: "events",
        title: "Ministry Events",
        description: "Create events specific to your ministry and track attendance.",
        icon: Calendar,
        target: "/events",
        action: "Create Event"
      },
      {
        id: "community",
        title: "Ministry Community",
        description: "Foster community within your ministry through discussions and prayer.",
        icon: MessageSquare,
        target: "/community",
        action: "Engage Community"
      },
      {
        id: "resources",
        title: "Ministry Resources",
        description: "Access and share resources relevant to your ministry focus.",
        icon: BookOpen,
        target: "/bible",
        action: "Browse Resources"
      }
    ]
  },
  {
    role: "member",
    displayName: "Church Member",
    welcomeMessage: "Welcome to your church community! Here's how to make the most of your SoapBox experience.",
    color: "bg-green-100 text-green-800",
    steps: [
      {
        id: "dashboard",
        title: "Your Dashboard",
        description: "Track your Bible reading streak, prayer count, and spiritual growth milestones.",
        icon: BarChart3,
        target: "/",
        action: "View Dashboard"
      },
      {
        id: "community",
        title: "Community Hub",
        description: "Join discussions, share testimonies, and connect with fellow believers.",
        icon: Users,
        target: "/community",
        action: "Explore Community"
      },
      {
        id: "prayer",
        title: "Prayer Wall",
        description: "Share prayer requests and support others in their faith journey.",
        icon: Heart,
        target: "/prayer",
        action: "Visit Prayer Wall"
      },
      {
        id: "bible",
        title: "Bible Reading",
        description: "Follow reading plans, track progress, and grow in God's Word daily.",
        icon: BookOpen,
        target: "/bible",
        action: "Start Reading"
      },
      {
        id: "events",
        title: "Church Events",
        description: "Discover upcoming services, small groups, and ministry opportunities.",
        icon: Calendar,
        target: "/events",
        action: "View Events"
      },
      {
        id: "gamification",
        title: "Faith Journey",
        description: "Track achievements, participate in challenges, and see your spiritual growth.",
        icon: Target,
        target: "/leaderboard",
        action: "View Progress"
      }
    ]
  },
  {
    role: "volunteer",
    displayName: "Volunteer",
    welcomeMessage: "Thank you for your heart to serve! Explore opportunities to make a meaningful impact in your church community.",
    color: "bg-yellow-100 text-yellow-800",
    steps: [
      {
        id: "opportunities",
        title: "Volunteer Opportunities",
        description: "Find service opportunities that match your skills and passion.",
        icon: Target,
        target: "/",
        action: "Find Opportunities"
      },
      {
        id: "schedule",
        title: "Your Schedule",
        description: "Manage your volunteer commitments and upcoming service times.",
        icon: Calendar,
        target: "/events",
        action: "View Schedule"
      },
      {
        id: "team",
        title: "Volunteer Team",
        description: "Connect with other volunteers and ministry leaders.",
        icon: Users,
        target: "/community",
        action: "Meet Team"
      },
      {
        id: "training",
        title: "Training Resources",
        description: "Access training materials and resources for your volunteer role.",
        icon: BookOpen,
        target: "/bible",
        action: "Access Training"
      }
    ]
  },
  {
    role: "youth_leader",
    displayName: "Youth Leader",
    welcomeMessage: "Ready to impact the next generation! Your youth ministry tools are designed to engage and inspire young people.",
    color: "bg-orange-100 text-orange-800",
    steps: [
      {
        id: "youth_events",
        title: "Youth Events",
        description: "Create engaging events and activities for your youth group.",
        icon: Gamepad2,
        target: "/events",
        action: "Plan Youth Event"
      },
      {
        id: "youth_community",
        title: "Youth Community",
        description: "Foster a safe space for young people to connect and share.",
        icon: Coffee,
        target: "/community",
        action: "Build Community"
      },
      {
        id: "parent_communication",
        title: "Parent Communication",
        description: "Keep parents informed about youth activities and their child's participation.",
        icon: MessageSquare,
        target: "/",
        action: "Message Parents"
      },
      {
        id: "discipleship",
        title: "Youth Discipleship",
        description: "Track spiritual growth and provide age-appropriate Bible study resources.",
        icon: BookOpen,
        target: "/bible",
        action: "Youth Resources"
      }
    ]
  }
];

interface PersonalizedTourProps {
  isOpen: boolean;
  onComplete: () => void;
  userRole?: string;
}

export default function PersonalizedTour({ isOpen, onComplete, userRole }: PersonalizedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  
  // Get user's church role information
  const { data: userProfile } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!user
  });

  // Determine the appropriate tour configuration
  const getTourConfig = (): RoleTourConfig => {
    // Use provided userRole or try to determine from user profile
    const roleToUse = userRole || userProfile?.primaryRole || "member";
    
    // Map common role variations to our tour configs
    const roleMapping: Record<string, string> = {
      "pastor": "pastor",
      "associate_pastor": "pastor",
      "assistant_pastor": "pastor",
      "ministry_leader": "ministry_leader",
      "team_leader": "ministry_leader",
      "youth_leader": "youth_leader",
      "youth_pastor": "youth_leader",
      "volunteer": "volunteer",
      "member": "member",
      "deacon": "ministry_leader",
      "elder": "ministry_leader"
    };

    const mappedRole = roleMapping[roleToUse] || "member";
    return tourConfigs.find(config => config.role === mappedRole) || tourConfigs[2]; // Default to member
  };

  const tourConfig = getTourConfig();
  const progress = ((currentStep + 1) / tourConfig.steps.length) * 100;

  const nextStep = () => {
    if (currentStep < tourConfig.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onComplete();
  };

  if (!isOpen) return null;

  const currentStepData = tourConfig.steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <CardHeader className="text-center border-b bg-gradient-to-r from-[#5A2671] to-[#7B3F8C] text-white rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <Badge className={`${tourConfig.color} mb-3`}>
                {tourConfig.displayName}
              </Badge>
              <CardTitle className="text-2xl font-bold text-white">
                Welcome Tour
              </CardTitle>
              <p className="text-purple-100 mt-2">
                {tourConfig.welcomeMessage}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-purple-100 mb-2">
              <span>Step {currentStep + 1} of {tourConfig.steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="bg-purple-200" />
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#5A2671] to-[#7B3F8C] rounded-2xl mb-4"
                >
                  <currentStepData.icon className="h-8 w-8 text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {currentStepData.title}
                </h3>
                
                <p className="text-gray-600 text-lg leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>

              {currentStepData.action && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Ready to explore?</h4>
                      <p className="text-gray-600 text-sm">
                        {currentStepData.action} when you're ready
                      </p>
                    </div>
                    {currentStepData.target && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.location.href = currentStepData.target!;
                          onComplete();
                        }}
                        className="border-[#5A2671] text-[#5A2671] hover:bg-[#5A2671] hover:text-white"
                      >
                        Go Now
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <Button
              variant="ghost"
              onClick={skipTour}
              className="text-gray-500 hover:text-gray-700"
            >
              Skip Tour
            </Button>

            <Button
              onClick={nextStep}
              className="bg-[#5A2671] hover:bg-[#4A1F5A] text-white flex items-center space-x-2"
            >
              <span>{currentStep === tourConfig.steps.length - 1 ? 'Complete' : 'Next'}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </motion.div>
    </div>
  );
}