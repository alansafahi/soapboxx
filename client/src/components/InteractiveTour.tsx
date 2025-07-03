import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useLocation } from 'wouter';

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

interface InteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
  role: string;
}

const tourConfigs: InteractiveTourConfig[] = [
  {
    role: "platform_admin",
    displayName: "Platform Administrator",
    welcomeMessage: "Welcome to the complete platform management experience!",
    color: "bg-red-100 text-red-800 border-red-200",
    steps: [
      {
        id: "welcome",
        title: "Platform Administrator Welcome",
        description: "Complete platform oversight and management",
        page: "/admin",
        position: "center",
        content: "As a Platform Administrator, you have the highest level of access across the entire SoapBox ecosystem. You can manage all churches, users, billing, and system-wide configurations.",
        tips: [
          "Access all church accounts and user data",
          "Configure global platform settings and features",
          "Monitor system performance and security",
          "Manage billing and subscription plans"
        ],
        nextAction: "Let's explore your comprehensive dashboard"
      },
      {
        id: "multi_church_overview",
        title: "Multi-Church Management Dashboard",
        description: "Monitor and manage all churches on the platform",
        page: "/admin/churches",
        position: "center",
        content: "View all churches, their subscription status, user counts, and activity levels. Manage church configurations, upgrades, and support requests from this central hub.",
        tips: [
          "See church growth metrics and engagement levels",
          "Manage subscription plans and billing for all churches",
          "Quick access to church admin contacts and settings",
          "Monitor feature usage across all church accounts"
        ],
        nextAction: "Now let's look at global user management capabilities"
      },
      {
        id: "user_management",
        title: "Global User Management",
        description: "Oversee all platform users across churches",
        page: "/admin/users",
        position: "center",
        content: "Access comprehensive user data, resolve account issues, manage role assignments, and handle platform-wide user support requests.",
        tips: [
          "Search and filter users across all churches",
          "Resolve account verification and login issues",
          "Manage user roles and permissions globally",
          "Handle data privacy requests and account deletions"
        ],
        nextAction: "Let's examine system configuration and security tools"
      },
      {
        id: "system_configuration",
        title: "Platform Configuration & Security",
        description: "Configure global settings and security policies",
        page: "/admin/system",
        position: "center",
        content: "Manage platform-wide settings, security policies, feature flags, and integration configurations. Control what features are available to different subscription tiers.",
        tips: [
          "Configure feature availability by subscription tier",
          "Set global security policies and compliance rules",
          "Manage third-party integrations and API settings",
          "Monitor system health and performance metrics"
        ],
        nextAction: "Finally, let's review billing and analytics capabilities"
      },
      {
        id: "billing_analytics",
        title: "Revenue Analytics & Platform Insights",
        description: "Monitor platform performance and revenue",
        page: "/admin/analytics",
        position: "center",
        content: "Access comprehensive analytics on revenue, user growth, feature adoption, and platform performance. Generate reports for stakeholders and investors.",
        tips: [
          "Track monthly recurring revenue and churn rates",
          "Monitor user engagement and feature adoption",
          "Generate executive reports and business insights",
          "Identify growth opportunities and platform improvements"
        ],
        nextAction: "You're ready to manage the entire platform effectively!"
      }
    ]
  },
  {
    role: "church_admin",
    displayName: "Church Administrator",
    welcomeMessage: "Let's get your church community thriving on SoapBox!",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    steps: [
      {
        id: "welcome",
        title: "Church Admin Welcome",
        description: "Your central hub for church management",
        page: "/admin",
        position: "center",
        content: "As a Church Administrator, you're the backbone of your church's digital presence. You'll manage members, coordinate staff, organize events, and ensure your community stays connected.",
        tips: [
          "Full access to church member management",
          "Coordinate with staff and volunteers",
          "Organize events and track attendance",
          "Monitor church engagement and growth"
        ],
        nextAction: "Let's explore your member management tools"
      },
      {
        id: "member_management",
        title: "Member Management Hub",
        description: "Manage your church community effectively",
        page: "/admin/members",
        position: "center",
        content: "Add new members, update contact information, assign roles, and track member engagement. Use powerful filters to segment your congregation for targeted communication.",
        tips: [
          "Import members from spreadsheets or other systems",
          "Assign roles like volunteer, staff, or ministry leader",
          "Track attendance patterns and engagement metrics",
          "Send targeted messages to specific member groups"
        ],
        nextAction: "Now let's set up your staff and volunteer coordination"
      },
      {
        id: "staff_coordination",
        title: "Staff & Volunteer Coordination",
        description: "Organize your ministry teams effectively",
        page: "/admin/staff",
        position: "center",
        content: "Manage staff schedules, assign volunteer roles, coordinate ministry teams, and track service opportunities. Keep your entire team aligned and informed.",
        tips: [
          "Create staff schedules and manage time-off requests",
          "Assign volunteers to specific ministries and events",
          "Track volunteer hours and service contributions",
          "Send team updates and coordination messages"
        ],
        nextAction: "Let's explore event planning and management"
      },
      {
        id: "event_management",
        title: "Event Planning & Management",
        description: "Create engaging church events and activities",
        page: "/admin/events",
        position: "center",
        content: "Plan worship services, special events, small groups, and community activities. Track RSVPs, manage logistics, and measure event success.",
        tips: [
          "Create recurring events like weekly services",
          "Track RSVPs and attendance for planning purposes",
          "Manage event logistics like setup and volunteers",
          "Send event reminders and follow-up communications"
        ],
        nextAction: "Finally, let's review your church analytics and growth tools"
      },
      {
        id: "church_analytics",
        title: "Church Growth & Analytics",
        description: "Track your church's spiritual and numerical growth",
        page: "/admin/analytics",
        position: "center",
        content: "Monitor attendance trends, engagement levels, giving patterns, and community growth. Use insights to make informed decisions about your ministry.",
        tips: [
          "Track weekly attendance and seasonal trends",
          "Monitor member engagement across different activities",
          "Analyze giving patterns and financial health",
          "Identify opportunities for community growth and outreach"
        ],
        nextAction: "You're equipped to lead your church community to new heights!"
      }
    ]
  },
  {
    role: "staff",
    displayName: "Church Staff Member",
    welcomeMessage: "Welcome to your ministry management hub!",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    steps: [
      {
        id: "welcome",
        title: "Staff Member Welcome",
        description: "Your tools for effective ministry leadership",
        page: "/",
        position: "center",
        content: "As a staff member, you're a key leader in your church community. You'll coordinate with other staff, manage your ministry areas, and directly support church members in their spiritual journey.",
        tips: [
          "Coordinate with other staff members and leadership",
          "Manage your specific ministry areas and responsibilities",
          "Provide pastoral care and spiritual guidance",
          "Track member engagement in your ministry"
        ],
        nextAction: "Let's explore your ministry management tools"
      },
      {
        id: "ministry_management",
        title: "Ministry Area Management",
        description: "Lead your specific ministry effectively",
        page: "/ministry",
        position: "center",
        content: "Manage your ministry area, coordinate volunteers, plan ministry events, and track participant engagement. Whether it's youth, worship, or community outreach, you have the tools you need.",
        tips: [
          "Organize ministry-specific events and activities",
          "Recruit and coordinate volunteers for your ministry",
          "Track participant attendance and engagement",
          "Communicate with ministry team members and participants"
        ],
        nextAction: "Now let's look at pastoral care and member support tools"
      },
      {
        id: "pastoral_care",
        title: "Pastoral Care & Member Support",
        description: "Provide spiritual guidance and support",
        page: "/care",
        position: "center",
        content: "Access prayer requests, schedule pastoral visits, provide counseling support, and track member spiritual growth. Be there for your congregation when they need you most.",
        tips: [
          "Respond to prayer requests and spiritual support needs",
          "Schedule and track pastoral visits and counseling sessions",
          "Coordinate with other staff for comprehensive member care",
          "Maintain confidential notes and follow-up reminders"
        ],
        nextAction: "Let's explore collaboration and communication tools"
      },
      {
        id: "staff_collaboration",
        title: "Staff Team Collaboration",
        description: "Work effectively with your ministry team",
        page: "/team",
        position: "center",
        content: "Coordinate with other staff members, share ministry updates, collaborate on church-wide initiatives, and stay aligned with leadership vision and goals.",
        tips: [
          "Share ministry updates and coordination needs",
          "Collaborate on church-wide events and initiatives",
          "Access shared resources and ministry materials",
          "Participate in staff meetings and planning sessions"
        ],
        nextAction: "Finally, let's review your ministry growth and impact tracking"
      },
      {
        id: "ministry_impact",
        title: "Ministry Impact & Growth Tracking",
        description: "Measure and improve your ministry effectiveness",
        page: "/impact",
        position: "center",
        content: "Track the impact of your ministry, measure spiritual growth among participants, and identify opportunities for expansion and improvement.",
        tips: [
          "Monitor participation and engagement in your ministry",
          "Track spiritual growth and life transformation stories",
          "Identify volunteers ready for leadership development",
          "Plan ministry expansion and new initiative opportunities"
        ],
        nextAction: "You're ready to make a lasting impact in your ministry!"
      }
    ]
  },
  {
    role: "volunteer",
    displayName: "Church Volunteer",
    welcomeMessage: "Thank you for your heart to serve!",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    steps: [
      {
        id: "welcome",
        title: "Volunteer Welcome",
        description: "Your gateway to meaningful service",
        page: "/",
        position: "center",
        content: "As a volunteer, you're the hands and feet of your church community. You'll find service opportunities, coordinate with teams, and make a real difference in people's lives.",
        tips: [
          "Discover service opportunities that match your gifts",
          "Coordinate with volunteer teams and ministry leaders",
          "Track your service hours and impact",
          "Connect with other volunteers and build relationships"
        ],
        nextAction: "Let's find the perfect service opportunities for you"
      },
      {
        id: "service_opportunities",
        title: "Service Opportunities Hub",
        description: "Find ways to serve that match your gifts",
        page: "/volunteer",
        position: "center",
        content: "Browse available volunteer opportunities, sign up for regular commitments or one-time events, and discover new ways to use your gifts and talents for God's kingdom.",
        tips: [
          "Filter opportunities by your interests and availability",
          "Sign up for regular weekly or monthly commitments",
          "Join one-time events and special service projects",
          "Explore new ministry areas to expand your impact"
        ],
        nextAction: "Now let's look at team coordination and communication"
      },
      {
        id: "team_coordination",
        title: "Volunteer Team Coordination",
        description: "Stay connected with your service teams",
        page: "/teams",
        position: "center",
        content: "Communicate with your volunteer teams, coordinate schedules, share updates, and support each other in your service commitments.",
        tips: [
          "Coordinate schedules with your volunteer team",
          "Share updates and prayer requests with team members",
          "Access training materials and service guidelines",
          "Request help or find substitutes when needed"
        ],
        nextAction: "Let's explore service tracking and growth opportunities"
      },
      {
        id: "service_tracking",
        title: "Service Impact & Growth",
        description: "Track your service journey and spiritual growth",
        page: "/growth",
        position: "center",
        content: "See the impact of your service, track hours contributed, celebrate milestones, and discover opportunities for leadership development and increased responsibility.",
        tips: [
          "Track your volunteer hours and service contributions",
          "Celebrate service milestones and achievements",
          "See stories of lives impacted through your service",
          "Explore leadership opportunities and skill development"
        ],
        nextAction: "Finally, let's connect you with the broader church community"
      },
      {
        id: "community_connection",
        title: "Community Connection & Fellowship",
        description: "Build relationships through service",
        page: "/community",
        position: "center",
        content: "Connect with other volunteers, participate in fellowship activities, share your service journey, and build lasting friendships through your shared commitment to serving others.",
        tips: [
          "Connect with volunteers in other ministry areas",
          "Participate in volunteer appreciation events",
          "Share your service stories and testimonies",
          "Invite friends and family to join you in serving"
        ],
        nextAction: "You're ready to serve with purpose and joy!"
      }
    ]
  },
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
        content: "Welcome! This is your SoapBox dashboard - your central hub for spiritual growth and community connection. You can see your daily check-ins, upcoming events, and recent activities all in one place.",
        tips: [
          "Check in daily to track your spiritual journey",
          "View upcoming church events and activities", 
          "See your weekly faithfulness streak",
          "Access prayer requests from your community"
        ],
        nextAction: "Let's explore your church community connections"
      },
      {
        id: "community_engagement",
        title: "Community & Prayer Wall",
        description: "Connect with your church family",
        page: "/prayer",
        position: "center",
        content: "The Prayer Wall is where your church community comes together in prayer. You can submit prayer requests, pray for others, and see how God is moving in your church family's lives.",
        tips: [
          "Submit your own prayer requests for community support",
          "Pray for others and let them know you're praying",
          "Share testimonies and praise reports",
          "Connect with members through shared prayer"
        ],
        nextAction: "Now let's look at spiritual growth tools"
      },
      {
        id: "spiritual_growth",
        title: "Bible Study & Reading",
        description: "Explore God's Word daily",
        page: "/bible",
        position: "center",
        content: "The Bible section provides daily reading plans, verses, and study materials. Track your reading progress and engage with scripture through interactive features.",
        tips: [
          "Access complete Bible with search functionality",
          "Follow daily reading plans and devotionals",
          "Track your reading streaks and progress",
          "Bookmark favorite verses and passages"
        ],
        nextAction: "Let's explore church events and activities"
      },
      {
        id: "church_events",
        title: "Events & Activities",
        description: "Stay connected with church life",
        page: "/events",
        position: "center",
        content: "View all upcoming church events, services, and activities. RSVP for events and stay engaged with your church community's schedule.",
        tips: [
          "Browse upcoming church events and services",
          "RSVP for events you want to attend",
          "Get event details and location information",
          "Set reminders for important activities"
        ],
        nextAction: "Finally, let's look at community engagement"
      },
      {
        id: "community_leaderboard",
        title: "Community & Leaderboard",
        description: "Celebrate spiritual growth together",
        page: "/leaderboard",
        position: "center",
        content: "The Community Leaderboard shows spiritual engagement across your church. See weekly faithfulness rankings and celebrate growth as a church family.",
        tips: [
          "View weekly faithfulness and engagement rankings",
          "See community spiritual activity and participation",
          "Celebrate achievements and milestones together",
          "Get encouraged by your church's collective growth"
        ],
        nextAction: "You're ready to engage fully in your church community!"
      }
    ]
  }
];

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
      return 'bottom-[-8px] left-1/2 transform -translate-x-1/2 border-t-gray-800';
    case 'bottom':
      return 'top-[-8px] left-1/2 transform -translate-x-1/2 border-b-gray-800';
    case 'left':
      return 'right-[-8px] top-1/2 transform -translate-y-1/2 border-l-gray-800';
    case 'right':
      return 'left-[-8px] top-1/2 transform -translate-y-1/2 border-r-gray-800';
    case 'center':
    default:
      return 'hidden';
  }
}

function getArrowIcon(position: string) {
  switch (position) {
    case 'top':
      return <ArrowUp className="h-4 w-4" />;
    case 'bottom':
      return <ArrowDown className="h-4 w-4" />;
    case 'left':
      return <ArrowLeft className="h-4 w-4" />;
    case 'right':
      return <ArrowRight className="h-4 w-4" />;
    default:
      return null;
  }
}

export default function InteractiveTour({ isOpen, onClose, role }: InteractiveTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [location, setLocation] = useLocation();
  
  const config = tourConfigs.find(c => c.role === role);
  
  // Navigate to the page when step changes
  useEffect(() => {
    if (isOpen && config && config.steps[currentStep]) {
      const step = config.steps[currentStep];
      if (step.page && step.page !== location) {
        setLocation(step.page);
      }
    }
  }, [currentStep, isOpen, config, location, setLocation]);
  
  if (!isOpen || !config) {
    return null;
  }

  const step = config.steps[currentStep];
  const isLastStep = currentStep === config.steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <Card className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto ${getPositionClasses(step.position)}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge className={config.color}>
                {config.displayName}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {config.steps.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {step.title}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {step.description}
            </p>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              {step.content}
            </p>

            {step.tips && step.tips.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Key Tips:</h4>
                <ul className="space-y-2">
                  {step.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-600 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {step.nextAction && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Next:</strong> {step.nextAction}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
              >
                Skip Tour
              </Button>
              {!isFirstStep && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                >
                  Previous
                </Button>
              )}
            </div>

            <Button
              onClick={handleNext}
              className="bg-[#5A2671] hover:bg-[#4A1F5A] text-white"
            >
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>

          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#5A2671] h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / config.steps.length) * 100}%`
                }}
              />
            </div>
          </div>
        </CardContent>

        {/* Arrow pointer for non-center positions */}
        <div className={`absolute w-0 h-0 border-8 border-transparent ${getArrowPosition(step.position)}`} />
      </Card>
    </div>
  );
}