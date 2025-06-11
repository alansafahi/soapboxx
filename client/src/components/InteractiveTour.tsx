import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  SkipForward
} from "lucide-react";
import { useLocation } from "wouter";

interface TourStep {
  id: string;
  title: string;
  description: string;
  page: string; // The page to navigate to
  selector?: string; // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  content: string; // Detailed explanation
  tips?: string[]; // Key tips to highlight
  nextAction?: string; // What happens next
}

interface InteractiveTourConfig {
  role: string;
  displayName: string;
  welcomeMessage: string;
  steps: TourStep[];
  color: string;
}

const tourConfigs: InteractiveTourConfig[] = [
  {
    role: "member",
    displayName: "Church Member",
    welcomeMessage: "Let's explore how to connect, grow, and engage in your faith journey!",
    color: "bg-green-100 text-green-800 border-green-200",
    steps: [
      {
        id: "welcome",
        title: "Welcome to SoapBox",
        description: "Your spiritual community hub",
        page: "/",
        position: "center",
        content: "Welcome! SoapBox connects you with your church community, helps you grow spiritually, and keeps you engaged with what matters most in your faith journey.",
        tips: [
          "Access everything from one central dashboard",
          "Stay connected with your church family",
          "Track your spiritual growth progress"
        ]
      },
      {
        id: "find_churches",
        title: "Discover Churches",
        description: "Find a spiritual home that fits your beliefs",
        page: "/churches",
        selector: ".church-card",
        position: "right",
        content: "Browse churches in your area and find one that aligns with your faith tradition. Each church profile shows their denomination, location, and community focus.",
        tips: [
          "Filter by denomination and location",
          "Read about each church's mission",
          "See upcoming events and services"
        ],
        nextAction: "We'll show you daily Bible reading next"
      },
      {
        id: "daily_bible",
        title: "Daily Bible Reading",
        description: "Build consistent scripture habits",
        page: "/bible",
        selector: ".reading-plan",
        position: "left",
        content: "Start your day with guided Bible reading. Choose from various reading plans, track your progress, and reflect on daily verses.",
        tips: [
          "Multiple reading plans available",
          "Track your reading streaks",
          "Share insights with your community"
        ],
        nextAction: "Let's explore the prayer wall"
      },
      {
        id: "prayer_wall",
        title: "Community Prayer",
        description: "Share prayer requests and support others",
        page: "/prayer",
        selector: ".prayer-request",
        position: "top",
        content: "Join your community in prayer by sharing requests and supporting others. This is where faith becomes fellowship.",
        tips: [
          "Share your prayer needs anonymously if preferred",
          "Pray for others and offer encouragement",
          "See answered prayers and testimonies"
        ],
        nextAction: "Finally, let's check your spiritual progress"
      },
      {
        id: "spiritual_progress",
        title: "Track Your Growth",
        description: "See your faith journey milestones",
        page: "/leaderboard",
        selector: ".achievement-badge",
        position: "bottom",
        content: "Celebrate your spiritual milestones! Earn badges for reading consistency, prayer participation, and community engagement.",
        tips: [
          "Earn badges for various spiritual activities",
          "See your reading streaks and participation",
          "Connect with other growing believers"
        ]
      }
    ]
  },
  {
    role: "volunteer",
    displayName: "Volunteer",
    welcomeMessage: "Discover how to serve and make an impact in your church community!",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    steps: [
      {
        id: "volunteer_welcome",
        title: "Volunteer Dashboard",
        description: "Your service hub",
        page: "/",
        position: "center",
        content: "As a volunteer, you're the heart of church ministry! This dashboard shows your upcoming service opportunities and impact metrics.",
        tips: [
          "View your upcoming volunteer commitments",
          "See the impact of your service",
          "Connect with other volunteers"
        ]
      },
      {
        id: "volunteer_events",
        title: "Service Opportunities",
        description: "Find ways to serve and help",
        page: "/events",
        selector: ".volunteer-opportunity",
        position: "right",
        content: "Browse upcoming events where volunteers are needed. From children's ministry to community outreach, find where your gifts can shine.",
        tips: [
          "Sign up for events that match your skills",
          "See time commitments and requirements",
          "Connect with ministry leaders"
        ],
        nextAction: "Let's see how to connect with your team"
      },
      {
        id: "volunteer_messages",
        title: "Team Communication",
        description: "Stay connected with ministry teams",
        page: "/messages",
        selector: ".ministry-chat",
        position: "left",
        content: "Communicate with your ministry teams, get updates about service opportunities, and coordinate with other volunteers.",
        tips: [
          "Direct messaging with ministry leaders",
          "Group chats for team coordination",
          "Important announcements and updates"
        ]
      }
    ]
  },
  {
    role: "youth_leader",
    displayName: "Youth Leader",
    welcomeMessage: "Learn how to engage and mentor the next generation!",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    steps: [
      {
        id: "youth_dashboard",
        title: "Youth Ministry Hub",
        description: "Your central command for youth engagement",
        page: "/",
        position: "center",
        content: "Welcome to your youth ministry dashboard! Here you can track youth engagement, plan events, and connect with families.",
        tips: [
          "Monitor youth participation and growth",
          "Coordinate with parents and volunteers",
          "Plan age-appropriate activities and events"
        ]
      },
      {
        id: "youth_events",
        title: "Youth Events & Activities",
        description: "Create engaging experiences for young people",
        page: "/events",
        selector: ".youth-event",
        position: "right",
        content: "Plan and manage youth-specific events from Bible studies to community service projects. Create experiences that build faith and community.",
        tips: [
          "Age-appropriate content and activities",
          "Track attendance and engagement",
          "Coordinate with parent volunteers"
        ],
        nextAction: "Let's see how to communicate with youth and families"
      },
      {
        id: "youth_communication",
        title: "Family Communication",
        description: "Stay connected with youth and their families",
        page: "/messages",
        selector: ".family-chat",
        position: "left",
        content: "Maintain healthy communication with youth participants and their families. Share updates, coordinate activities, and provide pastoral care.",
        tips: [
          "Direct messaging with appropriate oversight",
          "Group communications for events",
          "Parent notifications and updates"
        ]
      }
    ]
  },
  {
    role: "ministry_leader",
    displayName: "Ministry Leader",
    welcomeMessage: "Discover tools to lead and grow your ministry effectively!",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    steps: [
      {
        id: "ministry_overview",
        title: "Ministry Dashboard",
        description: "Comprehensive ministry management",
        page: "/",
        position: "center",
        content: "Your ministry leadership hub provides insights into participation, volunteer coordination, and ministry impact metrics.",
        tips: [
          "Track ministry participation and growth",
          "Coordinate volunteers and resources",
          "Monitor ministry health and effectiveness"
        ]
      },
      {
        id: "volunteer_management",
        title: "Volunteer Coordination",
        description: "Recruit and manage your ministry team",
        page: "/events",
        selector: ".volunteer-section",
        position: "right",
        content: "Recruit, train, and schedule volunteers for your ministry. Match people's gifts with service opportunities.",
        tips: [
          "Volunteer recruitment and onboarding",
          "Skill-based ministry matching",
          "Training and development tracking"
        ],
        nextAction: "Now let's explore ministry communication tools"
      },
      {
        id: "ministry_communication",
        title: "Ministry Communication",
        description: "Keep your team informed and connected",
        page: "/messages",
        selector: ".ministry-updates",
        position: "left",
        content: "Communicate effectively with your ministry team, share announcements, and coordinate activities.",
        tips: [
          "Team-wide announcements and updates",
          "Private coordination with leadership",
          "Resource sharing and planning"
        ]
      }
    ]
  },
  {
    role: "lead_pastor",
    displayName: "Lead Pastor",
    welcomeMessage: "Access tools for pastoral care and church leadership!",
    color: "bg-red-100 text-red-800 border-red-200",
    steps: [
      {
        id: "pastoral_dashboard",
        title: "Pastoral Leadership Center",
        description: "Church-wide oversight and care",
        page: "/",
        position: "center",
        content: "Your pastoral dashboard provides a comprehensive view of church health, member care needs, and leadership priorities.",
        tips: [
          "Church-wide health and growth metrics",
          "Member care and pastoral needs",
          "Leadership coordination and oversight"
        ]
      },
      {
        id: "member_care",
        title: "Pastoral Care & Counseling",
        description: "Provide spiritual guidance and support",
        page: "/messages",
        selector: ".pastoral-care",
        position: "right",
        content: "Manage pastoral care requests, schedule counseling sessions, and provide spiritual guidance to church members.",
        tips: [
          "Confidential pastoral care communications",
          "Counseling session scheduling",
          "Crisis intervention and support"
        ],
        nextAction: "Let's see the prayer ministry tools"
      },
      {
        id: "prayer_ministry",
        title: "Prayer Ministry Oversight",
        description: "Lead the church in prayer and intercession",
        page: "/prayer",
        selector: ".pastoral-prayer",
        position: "left",
        content: "Oversee the church's prayer ministry, respond to urgent prayer needs, and lead corporate prayer initiatives.",
        tips: [
          "Review and respond to prayer requests",
          "Coordinate prayer teams and initiatives",
          "Lead corporate prayer events"
        ]
      }
    ]
  },
  {
    role: "social_manager",
    displayName: "Social Manager",
    welcomeMessage: "Learn to build community and enhance church communications!",
    color: "bg-teal-100 text-teal-800 border-teal-200",
    steps: [
      {
        id: "community_dashboard",
        title: "Community Engagement Hub",
        description: "Foster connections and communication",
        page: "/",
        position: "center",
        content: "Your social management dashboard helps you build community, moderate discussions, and enhance church communications.",
        tips: [
          "Monitor community engagement and health",
          "Facilitate meaningful connections",
          "Coordinate social events and activities"
        ]
      },
      {
        id: "community_building",
        title: "Community Discussions",
        description: "Facilitate meaningful conversations",
        page: "/community",
        selector: ".discussion-thread",
        position: "right",
        content: "Moderate and facilitate community discussions, help members connect, and foster a healthy online church environment.",
        tips: [
          "Moderate discussions with wisdom",
          "Facilitate introductions and connections",
          "Create engaging conversation starters"
        ],
        nextAction: "Next, we'll explore communication tools"
      },
      {
        id: "social_communication",
        title: "Church Communications",
        description: "Manage announcements and updates",
        page: "/messages",
        selector: ".church-announcements",
        position: "left",
        content: "Coordinate church-wide communications, manage announcements, and ensure important information reaches the congregation.",
        tips: [
          "Church-wide announcements and news",
          "Event promotion and coordination",
          "Member directory and connections"
        ]
      }
    ]
  },
  {
    role: "church_admin",
    displayName: "Church Admin",
    welcomeMessage: "Master the administrative tools that keep the church running smoothly!",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    steps: [
      {
        id: "admin_dashboard",
        title: "Administrative Control Center",
        description: "Church operations and management",
        page: "/admin",
        position: "center",
        content: "Your administrative dashboard provides comprehensive church management tools, member oversight, and operational controls.",
        tips: [
          "Complete church membership management",
          "Role and permission administration",
          "Church settings and configuration"
        ]
      },
      {
        id: "member_management",
        title: "Member Administration",
        description: "Manage church membership and roles",
        page: "/admin",
        selector: ".member-admin",
        position: "right",
        content: "Administer church membership, assign roles and permissions, and manage user access throughout the system.",
        tips: [
          "Add, edit, and manage member profiles",
          "Assign roles and permissions",
          "Track member engagement and participation"
        ],
        nextAction: "Let's explore church settings and configuration"
      },
      {
        id: "church_settings",
        title: "Church Configuration",
        description: "Configure church settings and preferences",
        page: "/admin",
        selector: ".church-settings",
        position: "left",
        content: "Configure church-wide settings, manage preferences, and customize the platform for your congregation's needs.",
        tips: [
          "Church profile and branding settings",
          "Communication and notification preferences",
          "Platform customization and features"
        ]
      }
    ]
  },
  {
    role: "church_owner",
    displayName: "Church Owner",
    welcomeMessage: "Welcome to complete church ownership and administration!",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    steps: [
      {
        id: "owner_dashboard",
        title: "Church Ownership Dashboard",
        description: "Complete church control and oversight",
        page: "/admin",
        position: "center",
        content: "As church owner, you have complete control over all church operations, staff management, and strategic oversight.",
        tips: [
          "Full administrative access and control",
          "Staff and leadership management",
          "Strategic oversight and reporting"
        ]
      },
      {
        id: "staff_management",
        title: "Staff & Leadership",
        description: "Manage church staff and leadership team",
        page: "/admin",
        selector: ".staff-management",
        position: "right",
        content: "Oversee your entire church staff, assign leadership roles, and manage organizational structure.",
        tips: [
          "Hire and manage church staff",
          "Define leadership hierarchy",
          "Performance oversight and development"
        ],
        nextAction: "Finally, let's explore strategic planning tools"
      },
      {
        id: "strategic_oversight",
        title: "Strategic Planning",
        description: "Church growth and strategic direction",
        page: "/admin",
        selector: ".strategic-planning",
        position: "left",
        content: "Access strategic planning tools, church growth analytics, and long-term visioning capabilities.",
        tips: [
          "Church growth and analytics",
          "Strategic planning and visioning",
          "Multi-campus and expansion planning"
        ]
      }
    ]
  }
];

interface InteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
  role: string;
}

export default function InteractiveTour({ isOpen, onClose, role }: InteractiveTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [location, navigate] = useLocation();
  
  const config = tourConfigs.find(c => c.role === role);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  if (!config) return null;

  const currentStepData = config.steps[currentStep];
  const progress = ((currentStep + 1) / config.steps.length) * 100;

  useEffect(() => {
    if (isOpen && currentStepData) {
      // Navigate to the step's page
      navigate(currentStepData.page);
    }
  }, [currentStep, isOpen, currentStepData, navigate]);

  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        if (currentStep < config.steps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 8000); // 8 seconds per step
      
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStep, config.steps.length]);

  const handleNext = () => {
    if (currentStep < config.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsPlaying(false);
    onClose();
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Overlay */}
        <div 
          ref={overlayRef}
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        />
        
        {/* Highlight area for specific elements */}
        {currentStepData.selector && (
          <div className="absolute inset-0 pointer-events-none">
            {/* This would highlight specific elements */}
            <div className="absolute border-4 border-purple-400 rounded-lg animate-pulse" />
          </div>
        )}

        {/* Tour Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`absolute ${getPositionClasses(currentStepData.position)} max-w-md`}
        >
          <Card className="shadow-2xl border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={config.color}>
                    {config.displayName}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Step {currentStep + 1} of {config.steps.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <CardTitle className="text-lg mb-2">
                  {currentStepData.title}
                </CardTitle>
                <p className="text-sm text-gray-600 mb-3">
                  {currentStepData.description}
                </p>
                <p className="text-sm leading-relaxed">
                  {currentStepData.content}
                </p>
              </div>

              {currentStepData.tips && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2 text-purple-900">
                    Key Features:
                  </h4>
                  <ul className="text-xs space-y-1 text-purple-800">
                    {currentStepData.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-500 mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentStepData.nextAction && (
                <div className="text-xs text-gray-500 italic">
                  {currentStepData.nextAction}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlayback}
                    className="gap-1"
                  >
                    {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    {isPlaying ? "Pause" : "Auto"}
                  </Button>
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevious}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-3 w-3" />
                      Back
                    </Button>
                  )}
                </div>
                
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 gap-1"
                >
                  {currentStep === config.steps.length - 1 ? "Complete" : "Next"}
                  {currentStep < config.steps.length - 1 && <ChevronRight className="h-3 w-3" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Directional Arrow */}
        {currentStepData.selector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute ${getArrowPosition(currentStepData.position)} text-purple-400`}
          >
            {getArrowIcon(currentStepData.position)}
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}

function getPositionClasses(position: string): string {
  switch (position) {
    case 'top':
      return 'top-4 left-1/2 transform -translate-x-1/2';
    case 'bottom':
      return 'bottom-4 left-1/2 transform -translate-x-1/2';
    case 'left':
      return 'left-4 top-1/2 transform -translate-y-1/2';
    case 'right':
      return 'right-4 top-1/2 transform -translate-y-1/2';
    case 'center':
    default:
      return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
  }
}

function getArrowPosition(position: string): string {
  switch (position) {
    case 'top':
      return 'top-32 left-1/2 transform -translate-x-1/2';
    case 'bottom':
      return 'bottom-32 left-1/2 transform -translate-x-1/2';
    case 'left':
      return 'left-80 top-1/2 transform -translate-y-1/2';
    case 'right':
      return 'right-80 top-1/2 transform -translate-y-1/2';
    default:
      return 'hidden';
  }
}

function getArrowIcon(position: string) {
  const className = "h-8 w-8 animate-bounce";
  switch (position) {
    case 'top':
      return <ArrowDown className={className} />;
    case 'bottom':
      return <ArrowUp className={className} />;
    case 'left':
      return <ArrowRight className={className} />;
    case 'right':
      return <ArrowLeft className={className} />;
    default:
      return null;
  }
}