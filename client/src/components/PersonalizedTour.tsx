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
    role: "church_owner",
    displayName: "Church Owner",
    welcomeMessage: "Welcome to SoapBox! As the church owner, you'll set up the infrastructure and governance for your spiritual community.",
    color: "bg-indigo-100 text-indigo-800",
    steps: [
      {
        id: "church_settings",
        title: "Church Settings",
        description: "Set your church name, denomination, and branding to create your unique identity.",
        icon: Church,
        target: "/admin",
        action: "Configure Church",
        highlight: "Start by personalizing your church profile and branding."
      },
      {
        id: "role_management",
        title: "Role Management",
        description: "Add staff members and assign permissions to build your leadership team.",
        icon: Shield,
        target: "/admin",
        action: "Assign Roles",
        highlight: "💡 Tip: Invite a Lead Pastor or Social Manager to help manage your community."
      },
      {
        id: "donations_setup",
        title: "Donations Setup",
        description: "Connect Stripe to start receiving secure online gifts and offerings.",
        icon: Gift,
        target: "/donations",
        action: "Setup Giving",
        highlight: "Enable digital giving to support your church's mission and ministries."
      },
      {
        id: "analytics",
        title: "Church Analytics",
        description: "Track prayer growth, member engagement, and giving patterns.",
        icon: BarChart3,
        target: "/leaderboard",
        action: "View Analytics",
        highlight: "Monitor your church's spiritual health and community growth."
      },
      {
        id: "broadcasts",
        title: "Announcements",
        description: "Send updates and broadcasts to your entire church community.",
        icon: Megaphone,
        target: "/community",
        action: "Send Broadcast",
        highlight: "Keep your congregation informed with church-wide communications."
      }
    ]
  },
  {
    role: "church_admin",
    displayName: "Church Admin",
    welcomeMessage: "Welcome to SoapBox! As a church admin, you'll manage day-to-day operations and keep your community connected.",
    color: "bg-blue-100 text-blue-800",
    steps: [
      {
        id: "members_panel",
        title: "Members Panel",
        description: "View and manage your church community, track attendance, and member details.",
        icon: Users,
        target: "/admin",
        action: "Manage Members",
        highlight: "Your central hub for managing church membership and engagement."
      },
      {
        id: "events_creation",
        title: "Events Management",
        description: "Create small groups, Bible studies, services, and special church events.",
        icon: Calendar,
        target: "/events",
        action: "Create Events",
        highlight: "💡 Tip: Consider syncing with your church calendar system."
      },
      {
        id: "devotionals",
        title: "Daily Bible & Devotionals",
        description: "Add custom spiritual content and reading plans for your congregation.",
        icon: BookOpen,
        target: "/bible",
        action: "Add Content",
        highlight: "Create personalized spiritual growth experiences for your members."
      },
      {
        id: "prayer_moderation",
        title: "Prayer Wall Moderation",
        description: "Approve, respond to, and manage prayer requests from your community.",
        icon: Heart,
        target: "/prayer",
        action: "Moderate Prayers",
        highlight: "Foster a safe and supportive prayer environment."
      },
      {
        id: "announcements",
        title: "Pinned Messages",
        description: "Keep everyone informed with important updates and announcements.",
        icon: MessageSquare,
        target: "/community",
        action: "Post Updates",
        highlight: "💡 Bonus: Add a welcome devotional for new members."
      }
    ]
  },
  {
    role: "pastor",
    displayName: "Lead Pastor",
    welcomeMessage: "Welcome to SoapBox! As a pastor, you'll provide spiritual leadership and meaningful content for your congregation.",
    color: "bg-purple-100 text-purple-800",
    steps: [
      {
        id: "sermons",
        title: "Sermon Management",
        description: "Upload or schedule this Sunday's sermon and share God's Word.",
        icon: Music,
        target: "/admin",
        action: "Upload Sermon",
        highlight: "Share your weekly messages and build a sermon library."
      },
      {
        id: "prayer_responses",
        title: "Prayer Requests",
        description: "Respond to your flock directly and provide spiritual guidance.",
        icon: Heart,
        target: "/prayer",
        action: "Respond to Prayers",
        highlight: "Connect personally with members through prayer and support."
      },
      {
        id: "upcoming_events",
        title: "Service Promotion",
        description: "Promote next week's service and upcoming spiritual events.",
        icon: Calendar,
        target: "/events",
        action: "Promote Services",
        highlight: "💡 Tip: Link Bible passages to upcoming events for deeper engagement."
      },
      {
        id: "member_messages",
        title: "Pastoral Care",
        description: "Start conversations with church members and provide personal guidance.",
        icon: MessageSquare,
        target: "/messages",
        action: "Message Members",
        highlight: "Build meaningful relationships through direct communication."
      },
      {
        id: "spiritual_dashboard",
        title: "Spiritual Dashboard",
        description: "Monitor spiritual engagement, growth patterns, and community health.",
        icon: BarChart3,
        target: "/",
        action: "View Insights",
        highlight: "Track your congregation's spiritual journey and engagement levels."
      }
    ]
  },
  {
    role: "social_manager",
    displayName: "Social Manager",
    welcomeMessage: "Welcome to SoapBox! As the social manager, you'll drive community interaction, media, and engagement across the platform.",
    color: "bg-pink-100 text-pink-800",
    steps: [
      {
        id: "posts_announcements",
        title: "Posts & Announcements",
        description: "Create engaging updates, reminders, and community content.",
        icon: Megaphone,
        target: "/community",
        action: "Create Posts",
        highlight: "Drive engagement with compelling content and timely announcements."
      },
      {
        id: "media_gallery",
        title: "Media Gallery",
        description: "Upload worship images, event videos, and visual content.",
        icon: Camera,
        target: "/admin",
        action: "Manage Media",
        highlight: "💡 Tip: Use design templates for professional-looking posts."
      },
      {
        id: "engagement_monitoring",
        title: "Community Engagement",
        description: "Monitor comments, likes, and conversations happening in your community.",
        icon: MessageSquare,
        target: "/community",
        action: "Monitor Activity",
        highlight: "Stay on top of community conversations and respond to member interactions."
      },
      {
        id: "gamification_management",
        title: "Leaderboard & Badges",
        description: "Encourage engagement through gamification elements and achievements.",
        icon: Target,
        target: "/leaderboard",
        action: "Manage Rewards",
        highlight: "Boost participation with badges, challenges, and recognition systems."
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
        id: "team_management",
        title: "Team Coordination",
        description: "Manage your ministry team, assign roles, and coordinate activities.",
        icon: Users,
        target: "/admin",
        action: "Manage Team",
        highlight: "Build and coordinate your ministry team for maximum impact."
      },
      {
        id: "volunteers",
        title: "Volunteer Management",
        description: "Recruit, train, and schedule volunteers for your ministry.",
        icon: UserCheck,
        target: "/",
        action: "Manage Volunteers",
        highlight: "Connect with volunteers and provide meaningful opportunities to serve."
      },
      {
        id: "events",
        title: "Ministry Events",
        description: "Create events specific to your ministry and track attendance.",
        icon: Calendar,
        target: "/events",
        action: "Create Event",
        highlight: "Plan impactful ministry events that align with your mission."
      },
      {
        id: "resources",
        title: "Ministry Resources",
        description: "Access and share resources relevant to your ministry focus.",
        icon: BookOpen,
        target: "/bible",
        action: "Browse Resources",
        highlight: "💡 Tip: Create resource libraries specific to your ministry's needs."
      }
    ]
  },
  {
    role: "member",
    displayName: "Church Member",
    welcomeMessage: "Welcome to your church community! Here's how to connect, grow, and engage in your faith journey.",
    color: "bg-green-100 text-green-800",
    steps: [
      {
        id: "find_church",
        title: "Find Your Circle",
        description: "Join a spiritual community near you and connect with local believers.",
        icon: Church,
        target: "/churches",
        action: "Find Churches",
        highlight: "Start by connecting with a church community that feels like home."
      },
      {
        id: "daily_bible",
        title: "Daily Bible Reading",
        description: "Start your scripture journey with guided reading plans and devotionals.",
        icon: BookOpen,
        target: "/bible",
        action: "Start Reading",
        highlight: "Build a consistent habit of daily scripture reading and meditation."
      },
      {
        id: "prayer_wall",
        title: "Prayer Wall",
        description: "Request prayer or pray for others in your community.",
        icon: Heart,
        target: "/prayer",
        action: "Join Prayer",
        highlight: "Share your prayer needs and support others through intercession."
      },
      {
        id: "spiritual_progress",
        title: "Spiritual Growth",
        description: "Track your faith journey with badges, achievements, and progress milestones.",
        icon: Target,
        target: "/leaderboard",
        action: "View Progress",
        highlight: "💡 Bonus: Ask about ministry interests for future matching opportunities."
      },
      {
        id: "pastoral_care",
        title: "Connect with Pastor",
        description: "Need guidance? Reach out to your pastor anytime for spiritual support.",
        icon: MessageSquare,
        target: "/messages",
        action: "Message Pastor",
        highlight: "Build a relationship with your spiritual leader for guidance and support."
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
        title: "Service Opportunities",
        description: "Find volunteer opportunities that match your skills, passion, and availability.",
        icon: Target,
        target: "/",
        action: "Find Opportunities",
        highlight: "Discover meaningful ways to serve your church and community."
      },
      {
        id: "schedule",
        title: "Volunteer Schedule",
        description: "Manage your service commitments and upcoming volunteer times.",
        icon: Calendar,
        target: "/events",
        action: "View Schedule",
        highlight: "Stay organized with your volunteer commitments and service schedule."
      },
      {
        id: "team",
        title: "Volunteer Community",
        description: "Connect with other volunteers, share experiences, and build relationships.",
        icon: Users,
        target: "/community",
        action: "Meet Team",
        highlight: "Build friendships with fellow volunteers who share your heart for service."
      },
      {
        id: "training",
        title: "Training & Resources",
        description: "Access training materials, guides, and resources for your volunteer role.",
        icon: BookOpen,
        target: "/bible",
        action: "Access Training",
        highlight: "Grow in your volunteer skills and spiritual development."
      },
      {
        id: "impact",
        title: "Service Impact",
        description: "Track your volunteer hours and see the impact of your service.",
        icon: BarChart3,
        target: "/leaderboard",
        action: "View Impact",
        highlight: "💡 Bonus: Celebrate your service milestones and volunteer achievements."
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
        title: "Youth Events & Activities",
        description: "Create engaging events, fun activities, and meaningful youth gatherings.",
        icon: Gamepad2,
        target: "/events",
        action: "Plan Youth Event",
        highlight: "Design events that connect with young hearts and build lasting faith."
      },
      {
        id: "youth_community",
        title: "Youth Community",
        description: "Foster a safe, supportive space for young people to connect and share.",
        icon: Coffee,
        target: "/community",
        action: "Build Community",
        highlight: "Create an authentic community where youth feel valued and heard."
      },
      {
        id: "parent_communication",
        title: "Parent Connection",
        description: "Keep parents informed about youth activities and their child's spiritual growth.",
        icon: MessageSquare,
        target: "/messages",
        action: "Message Parents",
        highlight: "Build strong partnerships with parents in youth spiritual development."
      },
      {
        id: "youth_discipleship",
        title: "Youth Discipleship",
        description: "Access age-appropriate Bible studies, discussion guides, and spiritual growth resources.",
        icon: BookOpen,
        target: "/bible",
        action: "Explore Resources",
        highlight: "Guide young people in their faith journey with relevant, engaging content."
      },
      {
        id: "youth_engagement",
        title: "Engagement Tracking",
        description: "Monitor youth participation, spiritual milestones, and community involvement.",
        icon: Target,
        target: "/leaderboard",
        action: "Track Growth",
        highlight: "💡 Tip: Use gamification to encourage consistent spiritual habits and community involvement."
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
      "church_owner": "church_owner",
      "owner": "church_owner",
      "church_admin": "church_admin",
      "admin": "church_admin",
      "administrator": "church_admin",
      "pastor": "pastor",
      "lead_pastor": "pastor",
      "associate_pastor": "pastor",
      "assistant_pastor": "pastor",
      "social_manager": "social_manager",
      "social_media_manager": "social_manager",
      "communications": "social_manager",
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

                {currentStepData.highlight && (
                  <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <p className="text-blue-800 text-sm font-medium leading-relaxed">
                      {currentStepData.highlight}
                    </p>
                  </div>
                )}
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